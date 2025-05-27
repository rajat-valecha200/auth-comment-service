"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { userAPI } from "../api/auth"

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers()
      setUsers(response.data.users)
    } catch (error) {
      toast.error("Failed to fetch users")
      console.error("Fetch users error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = async (userId, permission, value) => {
    try {
      const response = await userAPI.updateUserPermissions(userId, {
        [permission]: value,
      })

      setUsers(users.map((user) => (user.id === userId ? response.data.user : user)))

      toast.success("User permissions updated successfully!")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update permissions")
    }
  }

  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div>
      <h1>User Management</h1>

      <div className="card">
        <h2>All Users ({users.length})</h2>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div>
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="permissions-grid">
                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id={`read-${user.id}`}
                      checked={user.canRead}
                      onChange={(e) => handlePermissionChange(user.id, "canRead", e.target.checked)}
                    />
                    <label htmlFor={`read-${user.id}`}>Read Comments</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id={`write-${user.id}`}
                      checked={user.canWrite}
                      onChange={(e) => handlePermissionChange(user.id, "canWrite", e.target.checked)}
                    />
                    <label htmlFor={`write-${user.id}`}>Write Comments</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id={`delete-${user.id}`}
                      checked={user.canDelete}
                      onChange={(e) => handlePermissionChange(user.id, "canDelete", e.target.checked)}
                    />
                    <label htmlFor={`delete-${user.id}`}>Delete Comments</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Users
