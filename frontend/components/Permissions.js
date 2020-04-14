import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import Table from './styles/Table'
import SickButton from './styles/SickButton'

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION (
    $userId: ID!
    $permissions: [Permission]! 
  ) {
    updatePermissions (
      userId: $userId
      permissions: $permissions
    ) {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => {
      if (loading) { return <p>Loading...</p>; }
      return (
        <div>
          <Error error={error} />
          <div>
            <h2>Manage Permissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {possiblePermissions.map(permission => (
                    <th key={permission}>{permission}</th>
                  ))}
                  <th>👇</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(user => (
                  <UserPermissions key={user.id} user={user} />
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      );
    }}
  </Query >
)

class UserPermissions extends React.Component {

  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
      permissions: PropTypes.arrayOf(PropTypes.string),
    }).isRequired
  };

  state = {
    permissions: this.props.user.permissions
  };

  handlePermissionChange = e => {
    const { checked, value } = e.target;
    let permissions = this.state.permissions;
    if (checked) {
      permissions = [...permissions, value];
    } else {
      permissions = permissions.filter(p => p !== value);
    }
    this.setState({ permissions });
  };

  render() {
    const { user } = this.props;
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          userId: this.props.user.id,
          permissions: this.state.permissions,
        }}
        refetchQueries={[{ query: ALL_USERS_QUERY }]}>
        {(updatePermissions, { loading, error }) => (
          <>
            {error && <tr><td colspan="9"><Error error={error} /></td></tr>}
            <tr>
              <td>
                {user.name}
              </td>
              <td>
                {user.email}
              </td>
              {possiblePermissions.map(permission => (
                <td key={permission}>
                  <label htmlFor={`${user.id}-permission-${permission}`}>
                    <input
                      id={`${user.id}-permission-${permission}`}
                      type="checkbox"
                      checked={this.state.permissions.includes(permission)}
                      value={permission}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type="button"
                  disabled={loading}
                  onClick={updatePermissions}>
                  Updat{loading ? 'ing' : 'e'}
              </SickButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>
    );
  }

}

export default Permissions;