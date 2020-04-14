import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Item from './Item';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import formatMoney from '../lib/formatMoney';
import OrderItemStyles from './styles/OrderItemStyles';
import Pagination from './Pagination';
import { perPage } from '../config';

export const ORDERS_QUERY = gql`
  query ORDERS_QUERY {
    orders (orderBy: createdAt_DESC) {
      id
      total
      createdAt 
      items {
        id
        title
        price
        description
        quantity 
        image 
      }
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
  grid-gap: 4rem;
`;

const Orders = () => (
  <Query query={ORDERS_QUERY}>
    {({ data, error, loading }) => {
      if (loading) { return <p>Loading...</p>; }
      if (error) { return <p>{error.message}</p>; }
      const orders = data.orders;
      return (
        <div>
          <h2>You have {orders.length} orders</h2>
          <OrderUl>
            {orders.map(order => (
              <OrderItemStyles key={order.id}>
                <Link href={{
                  pathname: '/order',
                  query: { id: order.id }
                }}>
                  <a>
                    <div className="order-meta">
                      <p>{order.items.reduce((acc, c) => acc + c.quantity, 0)}</p>
                      <p>{order.items.length} Products</p>
                      <p>{formatDistance(order.createdAt, new Date())}</p>
                      <p>{formatMoney(order.total)}</p>
                    </div>
                    <div className="images">
                      {order.items.map(item => (
                        <img key={item.id} src={item.image} alt={item.title} />
                      ))}
                    </div>
                  </a>
                </Link>
              </OrderItemStyles>
            ))}
          </OrderUl>
        </div>
      );
    }}
  </Query>
);

export default Orders;
