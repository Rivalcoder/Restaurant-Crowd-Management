"use client"
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FaUsers, FaChair, FaClock, FaPhone, FaIdBadge } from 'react-icons/fa'
import { IoMdRestaurant } from 'react-icons/io'
import '../app/globals.css'

export default function CustomerDetails() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [dateFilterActive, setDateFilterActive] = useState(false)

  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem('customers')) || []
    setCustomers(storedCustomers)
    setIsLoading(false)
  }, [])

  const filteredCustomers = customers.filter(customer => {
    const matchesNameOrPhone = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                customer.phone.includes(searchTerm);
    
    const matchesDate = dateFilterActive ? 
      new Date(customer.addedAt).toLocaleDateString() === new Date(selectedDate).toLocaleDateString() : 
      true;

    return matchesNameOrPhone && matchesDate;
  });

  const handleDateFilter = () => {
    setDateFilterActive(!!selectedDate);
  };

  const handleCustomerLeave = (id) => {
    const leavingCustomer = customers.find(c => c.id === id);
    if (leavingCustomer) {
      // Update the status of the customer instead of removing them
      const updatedCustomers = customers.map(c => 
        c.id === id ? { ...c, status: 'left' } : c
      );
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));

      const newEmptySeats = emptySeats + leavingCustomer.size;
      setEmptySeats(newEmptySeats);
      localStorage.setItem('emptySeats', newEmptySeats.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>Customer Details | Restaurant Management</title>
      </Head>

      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IoMdRestaurant className="text-4xl text-amber-400" />
            <h1 className="text-3xl font-bold">Customer Details</h1>
          </div>
          <Link href="/" className="btn btn-primary">
            <FaUsers className="mr-2" />
            Back to Dashboard
          </Link>
        </header>

        <div className="mb-6">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-300 mb-1 mr-2">Filter by Date:</label>
            <input
              type="date"
              className="input input-bordered bg-gray-700 border-gray-600 w-40"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={handleDateFilter}
              className="btn btn-primary ml-2"
            >
              Apply Date Filter
            </button>
          </div>

          <div className="mt-4 relative flex items-center">
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="input input-bordered w-full pl-10 bg-gray-700 border-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaUsers className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="alert alert-info shadow-lg">
            <div>
              <FaUsers className="text-xl" />
              <span>{searchTerm ? 'No matching customers found' : 'No customers have been allocated yet'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-700 text-gray-200 w-full">
                  <tr>
                    <th className="flex items-center">
                      <FaIdBadge className="mr-2" /> ID
                    </th>
                    <th>Name</th>
                    <th>
                      <FaPhone className="mr-2" /> Phone
                    </th>
                    <th>
                      <FaUsers className="mr-2" /> Group
                    </th>
                    <th>
                      <FaClock className="mr-2" /> Seated At
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-700">
                      <td>{customer.id}</td>
                      <td className="font-medium">{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <span className="badge badge-info">
                          {customer.size} {customer.size > 1 ? 'people' : 'person'}
                        </span>
                      </td>
                      <td>
                        {new Date(customer.addedAt || Date.now()).toLocaleString()}
                      </td>
                      <td>{customer.status === 'left' ? 'Left' : 'Active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>
        )}
      </main>
    </div>
  )
}