"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { authAPI } from "../api/auth"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.forgotPassword(email)
      toast.success(response.data.message)

      // In development, show the reset token
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {resetToken && (
        <div className="success" style={{ marginTop: "1rem" }}>
          <strong>Development Mode:</strong> Your reset token is: {resetToken}
          <br />
          <Link to={`/reset-password?token=${resetToken}`}>Click here to reset your password</Link>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        Remember your password? <Link to="/login">Login</Link>
      </div>
    </div>
  )
}

export default ForgotPassword
