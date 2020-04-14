import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

export const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION (
    $name: String!
    $email: String!
    $password: String!
  ) {
    signup (
      name: $name
      password: $password
      email: $email
    ) {
      id
      email
      name
    }
  }
`;

class Signup extends Component {

  state = {
    email: '',
    name: '',
    password: '',
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value })
  };

  render() {
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
        {(signup, { loading, error }) => (
          <Form method="post" onSubmit={async e => {
            e.preventDefault();
            await signup();
            this.setState({ name: '', email: '', password: '' });
          }}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Up For An Account</h2>
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="Enter you email"
                  required
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  required
                  value={this.state.name}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Sign Up</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }

}

export default Signup;