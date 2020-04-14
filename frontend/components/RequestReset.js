import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

export const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION (
    $email: String!
  ) {
    requestReset (
      email: $email
    ) {
      message
    }
  }
`;

class RequestReset extends Component {

  state = {
    email: '',
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value })
  };

  render() {
    return (
      <Mutation
        mutation={REQUEST_RESET_MUTATION}
        variables={this.state}>
        {(requestReset, { loading, error, called }) => (
          <Form method="post" onSubmit={async e => {
            e.preventDefault();
            await requestReset();
            this.setState({ email: '' });
          }}>
            <Error error={error} />
            {!error && !loading && called && <p>Success! Check Your E-mail For A Reset Link</p>}
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request A Password Reset</h2>
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
              <button type="submit">Request Reset</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }

}

export default RequestReset;