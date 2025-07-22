import React, { useState } from 'react';
import './Register.css';

const Register = ({ onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (onRegister) {
        await onRegister(formData.username, formData.password, setSuccess);
        // Clear form on success
        setFormData({
          username: '',
          password: '',
          confirmPassword: ''
        });
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-overlay">
      <div className="register-background">
        <div className="aurora"></div>
        <div className="light-sweep"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
          <div className="shape shape-7"></div>
          <div className="shape shape-8"></div>
        </div>
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>
      
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">
            <span className="title-glow">Welcome,</span>
            <span className="title-accent"> Champion!</span>
          </h1>
          <p className="register-subtitle">Create your Champions League account</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`register-input ${errors.username ? 'error' : ''}`}
                placeholder="Username"
                required
              />
              <div className="input-border"></div>
              <div className="input-icon">👤</div>
            </div>
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`register-input ${errors.password ? 'error' : ''}`}
                placeholder="Password"
                required
              />
              <div className="input-border"></div>
              <div className="input-icon">🔒</div>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`register-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm Password"
                required
              />
              <div className="input-border"></div>
              <div className="input-icon">🔐</div>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="password-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              Show Password
            </label>
          </div>

          <button 
            type="submit" 
            className={`register-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting || success}
          >
            {success ? (
              <div className="button-content" style={{ color: '#68d391', fontWeight: 700 }}>
                <span>✅ You successfully signed up!</span>
              </div>
            ) : isSubmitting ? (
              <div className="button-content">
                <div className="spinner"></div>
                <span>Signing Up...</span>
              </div>
            ) : (
              <div className="button-content">
                <span>Sign Up</span>
                <div className="button-glow"></div>
              </div>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p className="login-link">
            Already have an account? 
            <button className="link-button" onClick={() => onClose && onClose()}>
              Sign In
            </button>
          </p>
        </div>

        <button className="close-button" onClick={() => onClose && onClose()}>
          <span>×</span>
        </button>
      </div>
    </div>
  );
};

export default Register; 