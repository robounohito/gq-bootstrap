import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

export const RESET_MUTATION = gql`
  mutation RESET_MUTATION (
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword (
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

class Reset extends Component {

  static propTypes = {
    resetToken: PropTypes.string.isRequired
  }

  state = {
    password: '',
    confirmPassword: '',
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value })
  };

  render() {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          password: this.state.password,
          confirmPassword: this.state.confirmPassword,
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
        {(resetPassword, { loading, error, called }) => (
          <Form method="post" onSubmit={async e => {
            e.preventDefault();
            await resetPassword();
            this.setState({ password: '', confirmPassword: '', });
          }}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset Your Password</h2>
              <label htmlFor="password">
                New Password
                <input
                  type="password"
                  name="password"
                  placeholder="Enter New Password"
                  required
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="confirmPassword">
                Confirm Your Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Your Password"
                  required
                  value={this.state.confirmPassword}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Reset Password</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }

}

export default Reset;