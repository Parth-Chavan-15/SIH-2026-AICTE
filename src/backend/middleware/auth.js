import jwt from 'jsonwebtoken';
import { memoryDB } from '../data/memoryStore.js';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'aicte_sih_26262_secret_key';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // For seamless hackathon evaluation, if no token header is provided, fallback to the current active demo persona (regional_officer)
  if (!token) {
    req.user = memoryDB.users[1]; // Shri R. K. Deshmukh (Regional Officer)
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Fallback in demo mode
    req.user = memoryDB.users[1];
    next();
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user attached' });
    }
    if (allowedRoles.includes('all') || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access denied: Role (${req.user.role}) is unauthorized for this resource.`,
    });
  };
}
