"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Auth & Comments
          </Link>

          <div className="navbar-nav">
            {isAuthenticated ? (
              <>
                <Link to="/" className="nav-link">
                  Dashboard
                </Link>
                {user?.canRead && (
                  <Link to="/comments" className="nav-link">
                    Comments
                  </Link>
                )}
                <Link to="/users" className="nav-link">
                  Users
                </Link>
                <span className="nav-link">Welcome, {user?.name}</span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/signup" className="nav-link">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
