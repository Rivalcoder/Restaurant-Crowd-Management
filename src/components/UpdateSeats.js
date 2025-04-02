import { useState } from 'react'

export default function UpdateSeats({ onUpdateSeats }) {
  const [seats, setSeats] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (seats <= 0) return
    
    onUpdateSeats(parseInt(seats))
    setSeats(0)
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Update Empty Seats</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Seats Available</span>
            </label>
            <input 
              type="number" 
              min="0"
              className="input input-bordered" 
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              required
            />
          </div>
          
          <div className="form-control mt-6">
            <button type="submit" className="btn btn-accent">Update Seats</button>
          </div>
        </form>
      </div>
    </div>
  )
}