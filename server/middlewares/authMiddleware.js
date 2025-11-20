const { verifyToken } = require('../utils/jwt');
const Doctor = require('../models/doctorModel');
const User = require('../models/user');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token missing or malformed' });
    }
    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const Model = decoded.role === 'doctor' ? Doctor : decoded.role === 'user' ? User : null;
    if (!Model) {
      return res.status(400).json({ message: 'Invalid role in token' });
    }

    const userDoc = await Model.findById(decoded.id).select('isActive lastActiveAt');
    if (!userDoc) {
      return res.status(404).json({ message: `${decoded.role} not found` });
    }

    if (decoded.role === 'doctor' && !userDoc.isActive) {
      return res.status(401).json({ message: 'Doctor is inactive. Please log in again.' });
    }

    userDoc.lastActiveAt = Date.now();
    userDoc.save().catch((err) => console.warn('Failed to update lastActiveAt:', err.message));

    req.userType = decoded.role;
    if (decoded.role === 'doctor') req.doctor = userDoc;
    if (decoded.role === 'user') req.user = userDoc;

    next();
  } catch (err) {
    console.error('Error in protect middleware:', err.message);
    return res.status(500).json({ message: 'Server error while verifying token' });
  }
};
