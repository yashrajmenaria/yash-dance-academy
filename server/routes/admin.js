const express = require('express');
const verifyToken = require('../middleware/auth')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Registration = require('../models/Registration');

const adminUser = {
  username: 'admin',
  passwordHash: '$2b$10$wzHwDvzCLHwEnwtGdax7guJnahQgvH25vyXUQDqi9gkJIw8ydolJW'
};

router.post('/login', async (req, res) => {
  const {
    username,
    password
  } = req.body;

  if (username !== adminUser.username) {
    return res.status(401).json({
      message: 'Invalid username'
    });
  }

  const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      message: 'Invalid password'
    });
  }

  const token = jwt.sign({
    username
  }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  res.json({
    token
  });
});

router.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: `Welcome admin, ${req.user.username}`
  });
});

router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Get total registrations
    const totalRegistrations = await Registration.countDocuments();
    
    // Get new registrations this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newRegistrations = await Registration.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Calculate growth (compare current month vs previous month)
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const previousMonthRegistrations = await Registration.countDocuments({
      createdAt: { 
        $gte: startOfPreviousMonth, 
        $lte: endOfPreviousMonth 
      }
    });
    
    let growth = 0;
    if (previousMonthRegistrations > 0) {
      growth = ((newRegistrations - previousMonthRegistrations) / previousMonthRegistrations) * 100;
    } else if (newRegistrations > 0) {
      growth = 100; // If no registrations last month but some this month
    }
    
    res.json({
      totalRegistrations,
      newRegistrations,
      growth: Math.round(growth * 10) / 10 // Round to 1 decimal place
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({
      message: 'Failed to fetch statistics'
    });
  }
});

router.get('/registrations', verifyToken, async (req, res) => {
  const allRegs = await Registration.find();
  try {
    const allRegs = await Registration.find();
    res.json(allRegs);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to fetch registrations'
    });
  }
});

router.delete('/registrations/:id', verifyToken, async (req, res) => {
  try {
    const result = await Registration.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Registration deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put('/registrations/:id', verifyToken, async (req, res) => {
  const updates = req.body; 
  try {
    const updated = await Registration.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;