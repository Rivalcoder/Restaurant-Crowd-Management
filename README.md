# 🍽️ Restaurant Crowd Management System

A modern web application for managing restaurant seating, customer queues, and real-time crowd control.

## 🌟 Features

| Feature | Description | Icon |
|---------|-------------|------|
| 📊 Dashboard | Real-time overview of restaurant status | 📈 |
| 👥 Customer Management | Add and track customer information | 👤 |
| ⏳ Waiting List | Manage customer queues efficiently | ⌛ |
| 💺 Seat Management | Track available and occupied seats | 🪑 |
| 📱 Responsive Design | Works on all devices | 📲 |
| 🤖 AI Calling System | Automated customer notifications using VAPI or Omnidimension | 📞 |

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js
- **Styling**: Tailwind CSS + DaisyUI
- **Icons**: React Icons
- **State Management**: React Hooks + LocalStorage
- **Font**: Geist (Sans + Mono)
- **Calling System**: VAPI for automated customer notifications

## 📦 Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
└── pages/              # Application pages
```

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/Rivalcoder/Restaurant-Crowd-Management
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 💡 Key Components

### Dashboard
- Real-time seat availability tracking
- Customer management interface
- Waiting list management
- Quick actions panel

### Customer Management
- Add new customers
- Track customer groups
- Manage seating arrangements
- Customer history

### Waiting List
- Queue management
- Priority seating
- Wait time tracking
- Customer notifications

## 🤖 AI Features

### Automated Calling System
- **VAPI Integration**: Simple integration with VAPI for automated customer calls
- **Smart Notifications**: Automated calls to customers when their table is ready
- **Queue Management**: Intelligent queue management with automated updates
- **Call Status Tracking**: Track call status and customer responses

### Benefits
- Reduced manual workload for staff
- Improved customer experience
- Efficient queue management
- Automated follow-ups

## 🔧 Configuration

The application uses local storage for data persistence. Key storage items:
- `emptySeats`: Available seating capacity
- `customers`: Currently seated customers
- `waitingList`: Customers in queue

## 🎨 UI Components

| Component | Purpose |
|-----------|---------|
| `CurrentStatus` | Displays real-time restaurant status |
| `CustomerForm` | Add new customer information |
| `CustomerList` | Display and manage seated customers |
| `ConfirmationModal` | Confirm critical actions |

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔐 Security

- Client-side data validation
- Secure form handling
- Protected routes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request




