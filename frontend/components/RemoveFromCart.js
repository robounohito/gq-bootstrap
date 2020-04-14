import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

const BigButton = styled.button`
   font-size: 3rem;
   background: none;
   border: 0;
   &:hover {
     color: ${props => props.theme.red};
     cursor: pointer; 
   }  
`;

export const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION (
    $id: ID!
  ) {
    removeFromCart (
      id: $id
    ) {
      id
    }
  }
`;

class RemoveFromCart extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  update = (cache, payload) => {
    let data = cache.readQuery({ query: CURRENT_USER_QUERY });
    const cartItemId = payload.data.removeFromCart.id;
    data = {
      ...data,
      me: {
        ...data.me,
        cart: data.me.cart.filter(item => item.id !== cartItemId)
      }
    };
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  }

  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id }}
        update={this.update}
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: { __typename: 'CartItem', id }
        }}>
        {(removeFromCart, { loading, error }) => (
          <BigButton
            title="Delete Item"
            disabled={loading}
            onClick={() => {
              removeFromCart().catch(err => {
                alert(err.message);
              })
            }}>
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }

}

export default RemoveFromCart;