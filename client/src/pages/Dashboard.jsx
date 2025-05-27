"use client"
import { useAuth } from "../context/AuthContext"

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="card">
        <h2>Welcome, {user?.name}!</h2>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        <h3>Your Permissions:</h3>
        <div className="permissions-grid">
          <div className="permission-item">
            <span>Read Comments:</span>
            <span style={{ color: user?.canRead ? "green" : "red" }}>{user?.canRead ? "✓ Allowed" : "✗ Denied"}</span>
          </div>
          <div className="permission-item">
            <span>Write Comments:</span>
            <span style={{ color: user?.canWrite ? "green" : "red" }}>{user?.canWrite ? "✓ Allowed" : "✗ Denied"}</span>
          </div>
          <div className="permission-item">
            <span>Delete Comments:</span>
            <span style={{ color: user?.canDelete ? "green" : "red" }}>
              {user?.canDelete ? "✓ Allowed" : "✗ Denied"}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {user?.canRead && (
            <a href="/comments" className="btn btn-primary">
              View Comments
            </a>
          )}
          <a href="/users" className="btn btn-secondary">
            Manage Users
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
