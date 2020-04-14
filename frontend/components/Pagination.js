import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import Link from 'next/link';
import Head from 'next/head';
import gql from 'graphql-tag';
import Router from 'next/router';
import PaginationStyles from './styles/PaginationStyles';
import Error from './ErrorMessage';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = (props) => (
  <Query query={PAGINATION_QUERY}>
    {({ error, data, loading }) => {
      if (error) { return <Error error={error} />; }
      if (loading) { return <p>Loading...</p>; }
      const count = data.itemsConnection.aggregate.count;
      const pages = Math.ceil(count / perPage);
      return (
        <PaginationStyles>
          <Head>
            <title>Sick Fits | Page {props.page} of {pages}</title>
          </Head>
          <Link href={{
            pathname: 'items',
            query: { page: props.page - 1 }
          }}>
            <a className="prev" aria-disabled={props.page <= 1}>Previous</a>
          </Link>
          <p>Page {props.page} of {pages}</p>
          <p>{count} Items Total</p>
          <Link href={{
            pathname: 'items',
            query: { page: props.page + 1 }
          }}>
            <a className="prev" aria-disabled={props.page >= pages}>Next</a>
          </Link>
        </PaginationStyles>
      );
    }}
  </Query>
)

export default Pagination;