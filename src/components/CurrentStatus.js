import { FaChair, FaUsers } from 'react-icons/fa'

export default function CurrentStatus({ emptySeats, customersCount }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Status</h2>
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FaChair className="text-3xl" />
          </div>
          <div className="stat-title">Empty Seats</div>
          <div className="stat-value text-primary">{emptySeats}</div>
          <div className="stat-desc">Available for customers</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <FaUsers className="text-3xl" />
          </div>
          <div className="stat-title">Customers</div>
          <div className="stat-value text-secondary">{customersCount}</div>
          <div className="stat-desc">Currently seated</div>
        </div>
      </div>
    </div>
  )
}