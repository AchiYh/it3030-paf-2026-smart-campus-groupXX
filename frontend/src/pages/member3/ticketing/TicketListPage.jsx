import { Link } from 'react-router-dom';

function TicketListPage() {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Ticket List</h2>
        <button className="btn btn-primary" type="button">+ New Ticket</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><Link to="/tickets/TCK-001">TCK-001</Link></td>
              <td>Sample issue placeholder</td>
              <td><span className="badge badge-open">OPEN</span></td>
              <td><span className="badge badge-warning">MEDIUM</span></td>
              <td>Unassigned</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketListPage;
