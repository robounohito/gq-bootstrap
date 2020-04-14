import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import styled from 'styled-components';
import Head from 'next/head';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import { SINGLE_ITEM_QUERY } from './UpdateItem'

const SingleItemStyled = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px; 
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`;

class SingleItem extends Component {

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ error, loading, data }) => {
          if (error) { return <Error error={error} />; }
          if (loading) { return <p>Loading...</p>; }
          if (!data.item) { return <p>Not found data for ID {this.props.id}</p> }
          return <SingleItemStyled>
            <Head>
              <title>Sick Fits | {data.item.title}</title>
            </Head>
            <img src={data.item.largeImage} alt="Item Large Image" />
            <div className="details">
              <h2>Viewing {data.item.title}</h2>
              <p>{data.item.description}</p>
            </div>
          </SingleItemStyled>
        }}
      </Query>
    );
  }

}

export default SingleItem;