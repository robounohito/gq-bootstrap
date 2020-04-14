import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import gql from 'graphql-tag';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

export const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION (
    $token: String!
  ) {
    createOrder (
      token: $token
    ) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

function totalItems(cart) {
  return cart.reduce((tally, item) => tally + item.quantity, 0);
}

class TakeMyMoney extends Component {

  onToken = async (res, createOrder) => {
    NProgress.start();
    const order = await createOrder({
      variables: {
        token: res.id
      }
    }).catch(err => alert(err.message));
    Router.push({
      pathname: '/order',
      query: { id: order.data.createOrder.id }
    });
  };

  render() {
    const { id } = this.props;
    return (
      <User>
        {({ data }) => (
          <Mutation
            mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
            {createOrder => (
              <StripeCheckout
                amount={calcTotalPrice(data.me.cart)}
                name='Sick Fits'
                description={`Order of ${totalItems(data.me.cart)} items`}
                image={data.me.cart.length && data.me.cart[0].item && data.me.cart[0].item.image}
                stripeKey='pk_test_25T76Hvkt0rvSdv6Q4ECC7yv00DFW9gTDg'
                currency='USD'
                email={data.me.email}
                token={res => this.onToken(res, createOrder)}>
                {this.props.children}
              </StripeCheckout>
            )}
          </Mutation>
        )}
      </User>
    );
  }

}

export default TakeMyMoney;