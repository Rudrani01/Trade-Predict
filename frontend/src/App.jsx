import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase/config'
import Navbar from './components/Navbar'
import Services from './components/Services'
import Teams from './components/Teams'
import ContactUs from './components/ContactUs'
import { Toaster } from 'react-hot-toast'
import Footer from "./components/Footer"
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import ResetPassword from './pages/ResetPassword'
import assets from './assets/assets'

const LandingPage = ({ theme, setTheme }) => {
  return (
    <div className="dark:bg-black relative">
      <Navbar theme={theme} setTheme={setTheme}/>
      <Login/>
      <Services />
      <Teams />
      <ContactUs />
      <Footer theme={theme} />
    </div>
  )
}

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-700 dark:text-white">Loading...</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/" />
}

const App = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light'
  )

  return (
    <Router>
      <img
        src={assets.bgImage2}
        alt=""
        className="fixed top-0 left-0 w-full h-full object-cover -z-10 dark:hidden pointer-events-none"
      />
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage theme={theme} setTheme={setTheme} />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  )
}

export default App