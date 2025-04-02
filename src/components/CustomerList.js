export default function CustomerList({ customers, onCustomerLeave }) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Seated Customers</h2>
          
          {customers.length === 0 ? (
            <div className="alert alert-info">
              <div>
                <span>No customers currently seated</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Group Size</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.size}</td>
                      <td>
                        <button 
                          onClick={() => onCustomerLeave(customer.id)}
                          className="btn btn-sm btn-error"
                        >
                          Leave
                        </button>
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