"use client"
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FaUsers, FaChair, FaClock, FaPlus, FaUserPlus, FaPhoneAlt, FaEllipsisH, FaCheckCircle, FaTimesCircle, FaBars, FaTimes, FaTrash } from 'react-icons/fa'
import { IoMdRestaurant } from 'react-icons/io'
import { MdUpdate, MdGroup, MdPersonAdd, MdCheckCircle, MdViewList, MdChevronRight, MdInfo, MdMoreVert, MdSupervisorAccount, MdDashboard, MdPerson, MdAccessTime, MdNotifications, MdSettings, MdOutlineNoteAdd } from 'react-icons/md'
import { HiOutlineStatusOnline } from 'react-icons/hi'
import { BsPeopleFill, BsFillPersonPlusFill, BsFillTelephoneFill, BsBell, BsGear } from 'react-icons/bs'
import ConfirmationModal from '../components/ConfirmationModal'
import '../app/globals.css'



export default function Dashboard() {
  const [emptySeats, setEmptySeats] = useState(0)
  const [customers, setCustomers] = useState([])
  const [waitingList, setWaitingList] = useState([])
  const [customSize, setCustomSize] = useState(2)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [notificationCount, setNotificationCount] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [showAllCustomers, setShowAllCustomers] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', size: 2 })

  // Load initial data
  useEffect(() => {
    const storedSeats = localStorage.getItem('emptySeats')
    const storedCustomers = JSON.parse(localStorage.getItem('customers')) || []
    const storedWaiting = JSON.parse(localStorage.getItem('waitingList')) || []
    
    if (storedSeats) setEmptySeats(parseInt(storedSeats))
    setCustomers(storedCustomers)
    setWaitingList(storedWaiting)
    setIsInitialized(true)
    
    // Calculate notification count (waiting customers)
    setNotificationCount(storedWaiting.length)
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
        setNotificationCount(newWaitingList.length)
        
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
      setNotificationCount(updatedWaitingList.length)
      localStorage.setItem('waitingList', JSON.stringify(updatedWaitingList))
    }
  }

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
    .slice(0, showAllCustomers ? customers.length : 5);

  const getWaitTime = (addedAt) => {
    const addedTime = new Date(addedAt);
    const currentTime = new Date();
    const diffInMinutes = Math.floor((currentTime - addedTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };
  
  const handleSeatNextGroup = () => {
    if (waitingList.length > 0 && emptySeats > 0) {
      const nextGroup = waitingList[0];
      if (nextGroup.size <= emptySeats) {
        handleAddCustomer(nextGroup);
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const phone = e.target.phone.value.trim();
    const size = customSize === 'custom' ? parseInt(e.target.customSize.value) : parseInt(customSize);
    
    if (name && phone && size) {
      handleAddCustomer({ name, phone, size });
      setFormSubmitted(true);
      e.target.reset();
      setCustomSize(2);
      
      // Reset form submitted state after a short delay
      setTimeout(() => {
        setFormSubmitted(false);
      }, 2000);
    }
  };

  const handleViewAllCustomers = () => {
    setActiveTab('seated');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Head>
        <title>Restaurant Crowd Management</title>
        <meta name="description" content="Manage restaurant crowd efficiently" />
      </Head>

      <div className="flex">
        {/* Sidebar Toggle Button - Moved back to left side */}
        <button 
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-20 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100 transition-all ${sidebarVisible ? 'transform scale-100' : 'transform scale-90'}`}
        >
          {sidebarVisible ? <FaBars /> : <FaBars />}
        </button>

        {/* Sidebar */}
        <div className={`${sidebarVisible ? 'w-64' : 'w-0'} bg-white shadow-xl h-screen fixed left-0 top-0 z-10 transition-all duration-300 overflow-hidden`}>
          <div className="p-4 flex items-center justify-center border-b border-gray-200">
            <IoMdRestaurant className="text-3xl text-indigo-600 mr-2" />
            <h1 className="text-xl font-bold text-indigo-700">Management</h1>
          </div>
          
          <nav className="mt-8">
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center w-full px-6 py-3 text-left ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <MdDashboard className="mr-3 text-xl" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('add-customer')}
                  className={`flex items-center w-full px-6 py-3 text-left ${activeTab === 'add-customer' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <BsFillPersonPlusFill className="mr-3 text-xl" />
                  <span>Add Customer</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('waiting-list')}
                  className={`flex items-center w-full px-6 py-3 text-left ${activeTab === 'waiting-list' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <MdAccessTime className="mr-3 text-xl" />
                  <span>Waiting List</span>
                  {notificationCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('seated')}
                  className={`flex items-center w-full px-6 py-3 text-left ${activeTab === 'seated' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <MdSupervisorAccount className="mr-3 text-xl" />
                  <span>Seated Customers</span>
                </button>
              </li>
              <li>
                {/* <Link href="/customer-details" className="flex items-center w-full px-6 py-3 text-left text-gray-600 hover:bg-gray-100">
                  <FaUsers className="mr-3 text-xl" />
                  <span>All Records</span>
                </Link> */}
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`${sidebarVisible ? 'ml-64' : 'ml-0'} flex-1 p-8 transition-all duration-300`}>
          {/* Header */}
          <header className="bg-white shadow-sm rounded-lg p-4 mb-6 flex justify-between items-center border border-gray-100">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-800">
                {activeTab === 'dashboard' && 'Restaurant Overview'}
                {activeTab === 'add-customer' && 'Add New Customer'}
                {activeTab === 'waiting-list' && 'Waiting List'}
                {activeTab === 'seated' && 'Seated Customers'}
              </h1>
            </div>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm">
                <FaChair className="inline mr-2" />
                <span>{emptySeats} Seats Available</span>
              </div>
            </div>
          </header>

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Main Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Empty Seats Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl transform hover:-translate-y-1 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Available Seats</p>
                      <h3 className="text-4xl font-bold text-gray-800 mt-1">{emptySeats}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaChair className="text-2xl text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (emptySeats / (emptySeats + customers.length)) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500">Available rate</p>
                      <p className="text-xs font-medium">
                        {Math.round((emptySeats / (emptySeats + customers.length)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seated Customers Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Seated Customers</p>
                      <h3 className="text-4xl font-bold text-gray-800 mt-1">{customers.length}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <MdSupervisorAccount className="text-2xl text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (customers.length / (customers.length + emptySeats)) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500">Occupancy rate</p>
                      <p className="text-xs font-medium">
                        {Math.round((customers.length / (customers.length + emptySeats)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Waiting Groups Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Waiting Groups</p>
                      <h3 className="text-4xl font-bold text-gray-800 mt-1">{waitingList.length}</h3>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <MdAccessTime className="text-2xl text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    {waitingList.length === 0 ? (
                      <div className="flex items-center text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <p className="text-sm font-medium">No waiting customers</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center text-amber-600">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                          <p className="text-sm font-medium">Next group ready to seat</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <p className="font-medium">{waitingList[0]?.name}</p>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-600">{waitingList[0]?.size} people</p>
                            <p className="text-sm text-gray-600">{getWaitTime(waitingList[0]?.addedAt)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Section: Update Seats Form and Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Update Seats Form */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Update Available Seats</h2>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500">Current total: {emptySeats + customers.length}</div>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const seats = parseInt(e.target.seats.value);
                      if (!isNaN(seats)) {
                        handleUpdateSeats(seats);
                        e.target.reset();
                      }
                    }} className="flex items-end space-x-4">
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seats to Add/Remove</label>
                        <input 
                          type="number" 
                          name="seats"
                          placeholder="Enter a positive or negative number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center gap-2 shadow-md"
                      >
                        <span>Update</span>
                        <MdUpdate />
                      </button>
                    </form>
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Quick Add Seats</label>
                      <div className="grid grid-cols-4 gap-3">
                        <button 
                          onClick={() => handleUpdateSeats(1)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center"
                        >
                          +1 Seat
                        </button>
                        <button 
                          onClick={() => handleUpdateSeats(2)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center"
                        >
                          +2 Seats
                        </button>
                        <button 
                          onClick={() => handleUpdateSeats(3)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center"
                        >
                          +3 Seats
                        </button>
                        <button 
                          onClick={() => handleUpdateSeats(4)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center"
                        >
                          +4 Seats
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab('add-customer')}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <MdPersonAdd size={20} />
                      <span>Add New Customer</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('waiting-list')}
                      className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <MdAccessTime size={20} />
                      <span>View Waiting List</span>
                      {waitingList.length > 0 && (
                        <span className="bg-white text-teal-600 text-xs font-bold px-2 py-1 rounded-full">
                          {waitingList.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                  <button 
                    onClick={handleViewAllCustomers}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    View All <MdChevronRight className="ml-1" />
                  </button>
                </div>
                
                {recentCustomers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <MdInfo className="text-5xl mb-4 text-gray-300" />
                    <p className="text-lg">No recent activity to display</p>
                    <p className="text-sm mt-1">Activity will appear here as customers are seated and called</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Size</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seated At</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentCustomers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-800">{customer.name}</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <BsPeopleFill className="text-blue-500 mr-1" />
                                <span>{customer.size}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FaPhoneAlt className="text-gray-400 mr-1 text-xs" />
                                <span>{customer.phone}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                              {new Date(customer.addedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                customer.callStatus === 'Successful' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {customer.callStatus || 'Failed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}




{activeTab === 'add-customer' && (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-600 to-violet-500 p-4 text-white">
      <div className="flex items-center">
        <BsFillPersonPlusFill className="text-xl mr-2" />
        <h2 className="text-lg font-bold">Add New Guest</h2>
      </div>
    </div>
    
    <div className="p-6">
      <form onSubmit={handleFormSubmit} className="max-w-md mx-auto">
        {/* Name input */}
        <div className="mb-4">
          <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-1">
            Guest Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MdPerson className="text-indigo-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <input 
              id="customerName"
              type="text" 
              name="name"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300 text-gray-700 placeholder-gray-400" 
              placeholder="Enter guest name"
              required
            />
          </div>
        </div>
        
        {/* Phone number input */}
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1">
            Contact Number
          </label>
          <div className="flex items-stretch group">
            <div className="flex items-center bg-gray-50 px-3 border-2 border-gray-200 border-r-0 rounded-l-xl text-gray-700 font-medium">
              +91
            </div>
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <BsFillTelephoneFill className="text-indigo-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <input 
                id="phoneNumber"
                type="tel" 
                name="phone"
                className="w-full h-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300 text-gray-700 placeholder-gray-400" 
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
                required
                minLength={10}
                maxLength={10}
              />
            </div>
          </div>
        </div>
        
        {/* Party size selection - Simplified to only 1-4 */}
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Party Size
          </label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {[1, 2, 3, 4].map(num => (
              <button 
                key={num}
                type="button"
                onClick={() => setCustomSize(num)}
                className={`py-3 rounded-xl text-center transition-all ${
                  parseInt(customSize) === num 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          
          {/* Custom size input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaUsers className="text-indigo-400" />
            </div>
            <input 
              type="number" 
              name="customSize"
              min="1"
              max="50"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300"
              placeholder="Or enter custom size"
              value={customSize === 'custom' ? '' : customSize}
              onChange={(e) => setCustomSize(e.target.value)}
            />
          </div>
        </div>
        
        {/* Submit button */}
        <button 
          type="submit" 
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all mt-4 ${
            formSubmitted 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 shadow-lg'
          } text-white`}
        >
          {formSubmitted ? (
            <>
              <FaCheckCircle className="mr-2 text-lg" />
              Guest Added Successfully
            </>
          ) : (
            <>
              <FaUserPlus className="mr-2 text-lg" />
              Add Guest
            </>
          )}
        </button>
      </form>
    </div>
  </div>
)}




          {/* Waiting List View */}
          {activeTab === 'waiting-list' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <MdAccessTime className="text-amber-600 text-xl" />
                  </div>
                  <h2 className="text-lg font-semibold">Waiting List ({waitingList.length})</h2>
                </div>
                {waitingList.length > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
                    {waitingList.reduce((total, customer) => total + customer.size, 0)} people waiting
                  </span>
                )}
              </div>
              
              {waitingList.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaClock className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Waiting Customers</h3>
                  <p className="text-gray-500">All customers have been seated</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Size</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {waitingList.map((customer, index) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md">{index + 1}</span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-800">{customer.name}</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BsPeopleFill className="text-blue-500 mr-1" />
                              <span>{customer.size}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">{customer.phone}</td>
                          <td className="py-4 px-4 whitespace-nowrap">{getWaitTime(customer.addedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Seated Customers View */}
          {activeTab === 'seated' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <MdSupervisorAccount className="text-green-600 text-xl" />
                  </div>
                  <h2 className="text-lg font-semibold">Seated Customers ({customers.length})</h2>
                </div>
              </div>
              
              {customers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaUsers className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Seated Customers</h3>
                  <p className="text-gray-500">Add customers to see them here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Size</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seated At</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentCustomers.map((customer, index) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-800">{customer.name}</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BsPeopleFill className="text-blue-500 mr-1" />
                              <span>{customer.size}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaPhoneAlt className="text-gray-400 mr-1 text-xs" />
                              <span>{customer.phone}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                            {new Date(customer.addedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              customer.callStatus === 'Successful' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.callStatus || 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          <ConfirmationModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onConfirm={handleClearEmptySeats} 
          />
        </div>
      </div>
    </div>
  )
}