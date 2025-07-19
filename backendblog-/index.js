const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');

const otpStore = {};


const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_secret_key'; // Replace with your own secret

app.use(cors());
app.use(express.json());

// ✅ MySQL DB connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Riteshsoni@77',
  database: 'blogdb',
});

db.connect((err) => {
  if (err) throw err;
  console.log('🟢 Connected to MySQL database');
});

// 🔐 Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// 🧑 Register
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashedPassword],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'Email already exists.' });
        }
        return res.status(500).json({ error: err });
      }
      res.status(201).json({ message: 'User registered successfully.' });
    }
  );
});

// 🔑 Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  });
});

// 📝 Create blog (authenticated)
app.post('/blogs', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const user_id = req.user.id;

  db.query(
    'INSERT INTO blogs (title, content, user_id) VALUES (?, ?, ?)',
    [title, content, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Blog created successfully' });
    }
  );
});

// 📄 Get all blogs
app.get('/blogs', (req, res) => {
  db.query('SELECT * FROM blogs', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 👤 Get blogs of logged-in user only
app.get('/blogs/user', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.query('SELECT * FROM blogs WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Update a blog
app.put('/blogs/:id', (req, res) => {
  const { title, content } = req.body;
  const blogId = req.params.id;

  db.query(
    "UPDATE blogs SET title = ?, content = ? WHERE id = ?",
    [title, content, blogId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json("✅ Blog updated successfully!");
    }
  );
});

// ✅ Delete a blog
app.delete('/blogs/:id', (req, res) => {
  const blogId = req.params.id;

  db.query("DELETE FROM blogs WHERE id = ?", [blogId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json("✅ Blog deleted successfully!");
  });
});

// send email with otp 

app.post('/auth/send-otp', (req, res) => {
  console.log('📩 /auth/send-otp hit with email:', req?.body);
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  // Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found.' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    // Send email using nodemailer
    const transporter = nodemailer?.createTransport({
      service: 'gmail',
      auth: {
        user: 'riteshblackbuck13@gmail.com',       // ✅ Replace with your Gmail
        pass: 'ckvqtvvpsyqeknur'     // ✅ Use Gmail App Password
      }
    });

    const mailOptions = {
      from: 'riteshblackbuck13@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).json({ message: 'Failed to send OTP', error });
      res.status(200).json({ message: 'OTP sent to email' });
    });
  });
});

//otp verifiaction 

app.post('/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  if (otpStore[email] && otpStore[email] == otp) {
    return res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
});

//passward reset after verification 

app.post('/auth/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }

  if (otpStore[email] && otpStore[email] == otp) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    db.query("UPDATE users SET password = ? WHERE email = ?", 
      [hashedPassword, email], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      // Clean up OTP store
      delete otpStore[email];

      res.status(200).json({ message: 'Password reset successful.' });
    });
  } else {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
//