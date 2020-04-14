import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

export const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION (
    $email: String!
    $password: String!
  ) {
    signin (
      password: $password
      email: $email
    ) {
      id
      email
      name
    }
  }
`;

class Signin extends Component {

  state = {
    email: '',
    password: '',
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value })
  };

  render() {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
        {(signin, { loading, error }) => (
          <Form method="post" onSubmit={async e => {
            e.preventDefault();
            await signin();
            this.setState({ name: '', email: '', password: '' });
          }}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Into Your Account</h2>
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
              <button type="submit">Sign In</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }

}

export default Signin;