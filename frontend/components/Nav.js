import Link from 'next/link';
import { Mutation } from 'react-apollo';
import { TOGGLE_CART_MUTATION } from './Cart';
import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';
import CartCount from './CartCount';

const Nav = () => (
  <User>
    {({ data, loading }) => (
      <NavStyles>
        <Link href='/items'>
          <a>Shop</a>
        </Link>
        {!loading && data.me && (
          <>
            <Link href='/sell'>
              <a>Sell</a>
            </Link>
            <Link href='/orders'>
              <a>Orders</a>
            </Link>
            <Link href='/me'>
              <a>Account</a>
            </Link>
            <Signout />
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {(toggleCart) => (
                <button onClick={toggleCart}>
                  My cart
                  <CartCount count={data.me.cart.reduce((tally, item) => (tally + item.quantity), 0)} />
                </button>
              )}
            </Mutation>
          </>
        )}
        {!loading && !data.me && (
          <Link href='/signup'>
            <a>Signup</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>

);

export default Nav;
