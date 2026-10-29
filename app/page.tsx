import ResourcePanel from '../components/ResourcePanel';

export default function Home() {
  return (
    <main>
      <h1>k8s-app</h1>
      <p className="sub">
        Users go through Postgres stored procedures, items through a TypeORM repository.
      </p>
      <ResourcePanel
        title="Users"
        path="/api/users"
        fields={[
          { key: 'name', label: 'Name', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
        ]}
      />
      <ResourcePanel
        title="Items"
        path="/api/items"
        fields={[
          { key: 'name', label: 'Name', required: true },
          { key: 'description', label: 'Description' },
        ]}
      />
    </main>
  );
}
