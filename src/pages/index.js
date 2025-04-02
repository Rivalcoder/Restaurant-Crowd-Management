"use client"
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FaUsers, FaChair, FaClock, FaPlus, FaArrowRight, FaHome, FaList, FaUserPlus, FaDoorOpen } from 'react-icons/fa'
import { IoMdRestaurant } from 'react-icons/io'
import { MdUpdate, MdGroup } from 'react-icons/md'
import ConfirmationModal from '../components/ConfirmationModal'
import '../app/globals.css'
import CustomerDetails from './customer-details'

export default function Dashboard() {
  const [emptySeats, setEmptySeats] = useState(0)
  const [customers, setCustomers] = useState([])
  const [waitingList, setWaitingList] = useState([])
  const [customSize, setCustomSize] = useState(2)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load initial data
  useEffect(() => {
    const storedSeats = localStorage.getItem('emptySeats')
    const storedCustomers = JSON.parse(localStorage.getItem('customers')) || []
    const storedWaiting = JSON.parse(localStorage.getItem('waitingList')) || []
    
    if (storedSeats) setEmptySeats(parseInt(storedSeats))
    setCustomers(storedCustomers)
    setWaitingList(storedWaiting)
    setIsInitialized(true)
  }, [])

  // Handle seat assignments when empty seats or waiting list changes
  useEffect(() => {
    if (!isInitialized) return
    
    if (emptySeats > 0 && waitingList.length > 0) {
      const sortedWaitingList = [...waitingList].sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
      
      let seatsAvailable = emptySeats
      let newWaitingList = [...waitingList]
      let assignedCustomers = []
      
      for (let i = 0; i < sortedWaitingList.length; i++) {
        if (sortedWaitingList[i].size <= seatsAvailable) {
          assignedCustomers.push({
            ...sortedWaitingList[i],
            addedAt: new Date().toISOString(), // Update the addedAt time when seated
            callStatus: 'Pending'
          })
          seatsAvailable -= sortedWaitingList[i].size
          newWaitingList = newWaitingList.filter(c => c.id !== sortedWaitingList[i].id)
        }
      }
      
      if (assignedCustomers.length > 0) {
        // Update all state and storage in one go
        const updatedCustomers = [...customers, ...assignedCustomers]
        
        setCustomers(updatedCustomers)
        setWaitingList(newWaitingList)
        setEmptySeats(seatsAvailable)
        
        // Save to localStorage
        localStorage.setItem('customers', JSON.stringify(updatedCustomers))
        localStorage.setItem('waitingList', JSON.stringify(newWaitingList))
        localStorage.setItem('emptySeats', seatsAvailable.toString())

        // Initiate calls for assigned customers
        initiateCalls(assignedCustomers)
      }
    }
  }, [emptySeats, waitingList, isInitialized])

  const initiateCalls = async (customersToCall) => {
    for (const customer of customersToCall) {
      try {
        const response = await fetch('/api/initiateCall', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: customer.phone }),
        })

        if (!response.ok) {
          throw new Error(`Failed to initiate call: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Call initiated for:', customer.name, data)

        // Update call status
        setCustomers(prevCustomers => 
          prevCustomers.map(c => 
            c.id === customer.id ? { ...c, callStatus: 'Successful' } : c
          )
        )
      } catch (error) {
        console.error("Error making call for customer:", customer.name, error)
        
        // Update call status
        setCustomers(prevCustomers => 
          prevCustomers.map(c => 
            c.id === customer.id ? { ...c, callStatus: 'Failed' } : c
          )
        )
      }
    }
    
    // Update localStorage after all calls are processed
    setCustomers(prevCustomers => {
      localStorage.setItem('customers', JSON.stringify(prevCustomers))
      return prevCustomers
    })
  }

  const handleAddCustomer = async (customer) => {
    const newCustomer = { 
      ...customer, 
      id: Date.now(), 
      addedAt: new Date().toISOString(), 
      callStatus: 'Pending',
      phone: `+91${customer.phone}`
    }
    
    if (customer.size <= emptySeats) {
      const updatedCustomers = [...customers, newCustomer]
      
      setCustomers(updatedCustomers)
      setEmptySeats(emptySeats - customer.size)
      
      localStorage.setItem('customers', JSON.stringify(updatedCustomers))
      localStorage.setItem('emptySeats', (emptySeats - customer.size).toString())

      try {
        const response = await fetch('/api/initiateCall', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: newCustomer.phone }),
        })

        if (!response.ok) throw new Error('Failed to initiate call')

        const data = await response.json()
        console.log('Call initiated:', data)

        setCustomers(prev => 
          prev.map(c => 
            c.id === newCustomer.id ? { ...c, callStatus: 'Successful' } : c
          )
        )
      } catch (error) {
        console.error("Error making call:", error)
        setCustomers(prev => 
          prev.map(c => 
            c.id === newCustomer.id ? { ...c, callStatus: 'Failed' } : c
          )
        )
      } finally {
        // Ensure localStorage is updated
        setCustomers(prev => {
          localStorage.setItem('customers', JSON.stringify(prev))
          return prev
        })
      }
    } else {
      const updatedWaitingList = [...waitingList, newCustomer]
      setWaitingList(updatedWaitingList)
      localStorage.setItem('waitingList', JSON.stringify(updatedWaitingList))
    
    }
  }

  // const handleCustomerLeave = (id) => {
  //   const leavingCustomer = customers.find(c => c.id === id);
  //   if (leavingCustomer) {
  //     // Update the status of the customer instead of removing them
  //     const updatedCustomers = customers.map(c => 
  //       c.id === id ? { ...c, status: 'left' } : c
  //     );
  //     setCustomers(updatedCustomers);
  //     localStorage.setItem('customers', JSON.stringify(updatedCustomers));

  //     const newEmptySeats = emptySeats + leavingCustomer.size;
  //     setEmptySeats(newEmptySeats);
  //     localStorage.setItem('emptySeats', newEmptySeats.toString());
  //   }
  // };

  const handleUpdateSeats = (newSeats) => {
    setEmptySeats((prevSeats) => {
      const updatedSeats = prevSeats + newSeats;
      localStorage.setItem('emptySeats', updatedSeats.toString());
      return updatedSeats;
    });
  };
  

  const handleClearEmptySeats = () => {
    setEmptySeats(0)
    localStorage.setItem('emptySeats', '0')
    console.log("All empty seats cleared.")
    setIsModalOpen(false)
  }

  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 10); // This should include all customers regardless of their status

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>Restaurant Crowd Management</title>
        <meta name="description" content="Manage restaurant crowd efficiently" />
      </Head>

      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <IoMdRestaurant className="text-4xl text-amber-400" />
            <h1 className="text-3xl font-bold">Restaurant Crowd Management</h1>
          </div>
          <Link href="/customer-details" className="btn btn-primary btn-sm">
            <FaList className="mr-2" />
            View All Customers
          </Link>
        </header>

        {/* Control Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Add New Customer Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <FaUserPlus className="text-2xl text-amber-400 mr-2" />
              <h2 className="text-xl font-semibold">Add New Customer</h2>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const name = e.target.name.value
              const phone = e.target.phone.value
              const size = customSize === 'custom' ? parseInt(e.target.customSize.value) : customSize;
              if (name && phone && size) {
                handleAddCustomer({ name, phone, size })
                e.target.reset()
                setCustomSize(2);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    className="input input-bordered w-full bg-gray-700 border-gray-600" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone"
                    className="input input-bordered w-full bg-gray-700 border-gray-600" 
                    required
                    minLength={10}
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Group Size</label>
                  <select 
                    name="size"
                    className="select select-bordered w-full bg-gray-700 border-gray-600"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num > 1 ? 'people' : 'person'}</option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                  {customSize === 'custom' && (
                    <input 
                      type="number" 
                      name="customSize"
                      min="1" 
                      className="input input-bordered w-full bg-gray-700 border-gray-600 mt-2"
                      placeholder="Enter custom size"
                      required
                    />
                  )}
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  <FaPlus className="mr-2" /> Add Customer
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <MdGroup className="text-2xl text-amber-400 mr-2" />
              <h2 className="text-xl font-semibold">Current Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <FaChair className="text-xl text-blue-400 mr-2" />
                  <span>Empty Seats</span>
                </div>
                <span className="text-xl font-bold">{emptySeats}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <FaUsers className="text-xl text-green-400 mr-2" />
                  <span>Seated Customers</span>
                </div>
                <span className="text-xl font-bold">{customers.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <FaClock className="text-xl text-yellow-400 mr-2" />
                  <span>Waiting Groups</span>
                </div>
                <span className="text-xl font-bold">{waitingList.length}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-danger w-full mt-4"
            >
              Clear Empty Seats
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <MdUpdate className="text-2xl text-amber-400 mr-2" />
              <h2 className="text-xl font-semibold">Update Empty Seats</h2>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const seats = parseInt(e.target.seats.value)
              if (!isNaN(seats)) {
                handleUpdateSeats(seats)
                e.target.reset()
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Seats Available</label>
                  <input 
                    type="number" 
                    name="seats"
                    min="0"
                    className="input input-bordered w-full bg-gray-700 border-gray-600" 
                    required
                  />
                </div>
                <button type="submit" className="btn btn-accent w-full">
                  Update Seats
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => handleUpdateSeats(2)}
                    className="btn btn-outline btn-sm"
                  >
                    +2 Seats
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleUpdateSeats(4)}
                    className="btn btn-outline btn-sm"
                  >
                    +4 Seats
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onConfirm={handleClearEmptySeats} 
        />

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center">
              <FaClock className="text-xl text-yellow-400 mr-2" />
              <h2 className="text-xl font-semibold">Waiting Customers ({waitingList.length})</h2>
            </div>
            <div className="overflow-x-auto">
              {waitingList.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No customers waiting</div>
              ) : (
                <table className="table w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th>Position</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Group</th>
                      <th>Waiting Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingList.map((customer, index) => (
                      <tr key={customer.id} className="hover:bg-gray-700">
                        <td>{index + 1}</td>
                        <td>{customer.name}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.size}</td>
                        <td>{new Date(customer.addedAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center">
              <FaUsers className="text-xl text-green-400 mr-2" />
              <h2 className="text-xl font-semibold">Recently Seated (Last 10)</h2>
            </div>
            <div className="overflow-x-auto">
              {recentCustomers.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No customers seated yet</div>
              ) : (
                <table className="table w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="text-center">Name</th>
                      <th className="text-center">Group</th>
                      <th className="text-center">Seated At</th>
                      <th className="text-center">Phone</th>
                      <th className="text-center">Call Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCustomers.map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-700">
                        <td className="text-center">{customer.name}</td>
                        <td className="text-center">{customer.size}</td>
                        <td className="text-center" >{new Date(customer.addedAt).toLocaleTimeString()}</td>
                        <td className="text-center">{customer.phone}</td>
                        <td className="text-center">
                          <span className={`p-2 rounded-lg  ${customer.callStatus === 'Successful' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                            {customer.callStatus || 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}