import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Checkout from './pages/Checkout/Checkout'
import PaymentResult from './pages/PaymentResult/PaymentResult'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Checkout />} />
          <Route path="/payment/result" element={<PaymentResult />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App