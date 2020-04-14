import UpdateItem from '../components/UpdateItem';

const Update = ({ query }) => (
  <div>
    <UpdateItem id={query.id}>
    </UpdateItem>
  </div>
);

export default Update;