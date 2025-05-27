"use client"

import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData)

    if (result.success) {
      toast.success("Login successful!")
      navigate("/")
    } else {
      toast.error(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  )
}

export default Login
