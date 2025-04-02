export default function WaitingList({ waitingList, emptySeats }) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Waiting List</h2>
          
          {waitingList.length === 0 ? (
            <div className="alert alert-success">
              <div>
                <span>No customers waiting</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Group Size</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingList.map((customer, index) => (
                    <tr key={customer.id}>
                      <td>{index + 1}</td>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.size}</td>
                      <td>
                        {customer.size <= emptySeats ? (
                          <span className="badge badge-success">Ready to seat</span>
                        ) : (
                          <span className="badge badge-warning">Waiting</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }