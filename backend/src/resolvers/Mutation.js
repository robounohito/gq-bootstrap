const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const Mutations = {

  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that');
    }
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args,
        user: { connect: { id: ctx.request.userId } },
      },
    }, info);
    return item;
  },

  async updateItem(parent, args, ctx, info) {
    const data = { ...args };
    delete data.id;
    const item = await ctx.db.mutation.updateItem({ data, where: { id: args.id } }, info);
    return item;
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, '{ id title user { id } }');
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(
      permission => ['ADMIN', 'ITEMDELETE'].includes(permission)
    );
    if (!ownsItem && hasPermissions) {
      throw new Error('You not allowed to do that');
    }
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    const email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        email,
        password,
        permissions: { set: ['USER'] }
      }
    }, info);
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password');
    }
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye' };
  },

  async requestReset(parent, { email }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const resetToken = (await promisify(randomBytes)(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    await ctx.db.mutation.updateUser({
      where: { email, },
      data: { resetToken, resetTokenExpiry }
    });
    await transport.sendMail({
      from: 'kilesa@gmail.com',
      to: user.email,
      subject: 'Your token reset',
      html: makeANiceEmail(`Your password reset token is here:\n 
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}"/>
          Click here to reset
        </a>`)
    });
    return { message: 'Reset request sent' };
  },

  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error("Yo passwords don't match");
    }
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error('The token is either invalid or expired');
    }
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { id: user.id, },
      data: { password, resetToken: null, resetTokenExpiry: null }
    });
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return updatedUser;
  },

  async updatePermissions(parent, { permissions, userId }, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in');
    }
    const currentUser = await ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    return ctx.db.mutation.updateUser({
      data: { permissions: { set: permissions } },
      where: { id: userId }
    }, info);
  },

  async addToCart(_, { id }, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be logged in');
    }
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id }
      }
    });
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      });
    }
    return ctx.db.mutation.createCartItem({
      data: {
        user: { connect: { id: userId } },
        item: { connect: { id } },
      }
    });
  },

  async removeFromCart(_, { id }, ctx, info) {
    const cartItem = await ctx.db.query.cartItem(
      { where: { id } },
      `{ id, user { id } }`
    );
    if (!cartItem || cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cart item not found or you do not own it.');
    }
    return ctx.db.mutation.deleteCartItem({
      where: { id }
    }, info);
  },

  async createOrder(_, { token }, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be logged in to comlete this order.');
    }
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{ 
        id 
        name 
        email 
        cart { 
          id 
          quantity 
          item { id title price description image largeImage } 
        } 
       }`
    );
    const amount = user.cart.reduce((tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0);
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: token,
    });
    const orderItems = user.cart.map(cartItem => ({
      title: cartItem.item.title,
      description: cartItem.item.description,
      image: cartItem.item.image,
      largeImage: cartItem.item.largeImage,
      price: cartItem.item.price,
      quantity: cartItem.quantity,
      user: { connect: { id: userId } },
    }));
    const order = await ctx.db.mutation.createOrder({
      data: {
        charge: charge.id,
        total: charge.amount,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      }
    });
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: { id_in: cartItemIds }
    });
    return order;
  },

};

module.exports = Mutations;
