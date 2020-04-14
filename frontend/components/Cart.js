import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import SickButton from './styles/SickButton';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import User from './User';
import CartItem from './CartItem';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import TakeMyMoney from './TakeMyMoney';

export const LOCAL_STATE_QUERY = gql`
  query LOCAL_STATE_QUERY {
    cartOpen @client
  }
`;

export const TOGGLE_CART_MUTATION = gql`
  mutation TOGGLE_CART_MUTATION {
    toggleCart @client
  }
`;

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>,
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
});

const Cart = () => (
  <Composed>
    {({ user, toggleCart, localState }) => {
      if (user.loading || !user.data.me) { return null; }
      return (
        <CartStyles open={localState.data && localState.data.cartOpen}>
          <header>
            <CloseButton
              title="close"
              onClick={toggleCart}>
              &times;
            </CloseButton>
            <Supreme>{user.data.me.name}'s Cart</Supreme>
            <p>You Have {user.data.me.cart.length} Items In Your Cart</p>
          </header>
          <ul>
            {user.data.me.cart.map(item => (
              <CartItem key={item.id} cartItem={item} />
            ))}
          </ul>
          <footer>
            <p>{formatMoney(calcTotalPrice(user.data.me.cart))}</p>
            {user.data.me.cart.length && (
              <TakeMyMoney>
                <SickButton>Checkout</SickButton>
              </TakeMyMoney>
            )}
          </footer>
        </CartStyles>
      );
    }}
  </Composed>
);

export default Cart;   