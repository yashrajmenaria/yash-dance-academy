const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

// Middlewares
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/contactDance")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("DB connection error:", err));

// API Routes - Placed BEFORE static files to avoid route conflicts
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Multer Setup for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/videos')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dance-' + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Static Files & Views
app.use(express.static(path.join(__dirname, '../client/public')));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Model
const Registration = require('./models/Registration');

// Routes
app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));
app.get('/services', (req, res) => res.render('services'));

app.get('/contact', (req, res) => res.render('contact'));
app.post('/contact', upload.single('danceVideo'), async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      name: req.body.name,
      age: req.body.age,
      email: req.body.email,
      altEmail: req.body.altEmail,
      phone: `${req.body.countryCode}${req.body.phone}`,
      experience: req.body.experience,
      style: req.body.style,
      danceVideoPath: req.file ? req.file.path : null
    };
    await Registration.create(data);
    res.render('contact', { successMsg: 'You have successfully registered!' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving registration.");
  }
});

// Admin Pages
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/admin/login.html'));
});
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/admin/dashboard.html'));
});
app.get('/admin/registrations', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/admin/registrations.html'));
});

// Port & Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
