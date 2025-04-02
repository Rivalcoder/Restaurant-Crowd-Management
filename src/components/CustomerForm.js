import { useState } from 'react'

export default function AddCustomerForm({ onAddCustomer }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [size, setSize] = useState(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !phone || !size) return
    
    onAddCustomer({
      name,
      phone,
      size: parseInt(size)
    })
    
    setName('')
    setPhone('')
    setSize(1)
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>
            <input 
              type="tel" 
              className="input input-bordered" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Group Size</span>
            </label>
            <select 
              className="select select-bordered"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">Add Customer</button>
          </div>
        </form>
      </div>
    </div>
  )
}