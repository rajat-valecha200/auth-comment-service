"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import { authAPI } from "../api/auth"

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset token")
      navigate("/forgot-password")
    }
  }, [token, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword(token, formData.newPassword)
      toast.success("Password reset successful! Please login with your new password.")
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return null
  }

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        Remember your password? <Link to="/login">Login</Link>
      </div>
    </div>
  )
}

export default ResetPassword
