const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const hasPermission = req.user[`can${permission.charAt(0).toUpperCase() + permission.slice(1)}`]

    if (!hasPermission) {
      return res.status(403).json({ error: `${permission} permission required` })
    }

    next()
  }
}

module.exports = { requirePermission }
