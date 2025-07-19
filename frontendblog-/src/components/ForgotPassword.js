import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css'; // Optional: for styling

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const sendOtp = async () => {
    try {
      const res = await axios.post('http://localhost:3000/auth/send-otp', { email });
      setStep(2);
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Failed to send OTP.');
    }
  };

  const verifyOtpAndReset = async () => {
    try {
      const res = await axios.post('http://localhost:3000/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      setMessage(res.data.message);
      setStep(3);
    } catch (error) {
      setMessage('Failed to reset password.');
    }
  };

  return (
    <div className="forgot-container">
      <h2>Forgot Password</h2>

      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={verifyOtpAndReset}>Reset Password</button>
        </>
      )}

      {step === 3 && (
        <p style={{ color: 'green' }}>Password has been reset successfully!</p>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ForgotPassword;
