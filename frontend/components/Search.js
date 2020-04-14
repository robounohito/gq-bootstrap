import React, { Component } from 'react';
import Downshift from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import { DropDownItem, DropDown, SearchStyles } from './styles/DropDown';

const SEARCH_ITEM_QUERY = gql`
  query SEARCH_ITEM_QUERY (
    $searchTerm: String!
  ) {
    items (where: {
      OR: [
        { title_contains: $searchTerm },
        { description_contains: $searchTerm },
      ]
    }) {
      id
      title
      image
    }
  }
`;

class AutoComplete extends Component {

  state = {
    items: [],
    loading: false,
  };

  handleChange = debounce(async (e, client) => {
    this.setState({ loading: true });
    const res = await client.query({
      query: SEARCH_ITEM_QUERY,
      variables: {
        searchTerm: e.target.value,
      }
    });
    this.setState({
      items: res.data.items,
      loading: false,
    });
  }, 350);

  routeToItem(item) {
    Router.push({
      pathname: '/item',
      query: {
        id: item.id
      }
    });
  }

  render() {
    return (
      <SearchStyles>
        <Downshift
          onChange={this.routeToItem}
          itemToString={item => !item ? '' : item.title}>
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
            <div>
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      type: 'search',
                      placeholder: 'Search For An Item',
                      id: 'search',
                      className: this.state.loading ? 'loading' : '',
                      onChange: e => {
                        e.persist();
                        this.handleChange(e, client);
                      }
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      {...getItemProps({ item })}
                      key={item.id}
                      highlighted={index === highlightedIndex}>
                      <img width="50" src={item.image} alt={item.title} />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!this.state.loading && !this.state.items.length && (
                    <DropDownItem>Nothing Found For {inputValue}</DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }

}

export default AutoComplete; 