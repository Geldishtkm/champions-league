import React, { useState } from 'react';
import './Login.css';

const Login = ({ onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (onLogin) {
        await onLogin(formData.username, formData.password);
        // Clear form on success
        setFormData({
          username: '',
          password: ''
        });
        setErrors({});
      }
    } catch (error) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">
            <span className="title-glow">Welcome</span>
            <span className="title-accent"> Back</span>
          </h1>
          <p className="login-subtitle">Sign in to your Champions League account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`login-input ${errors.username ? 'error' : ''}`}
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
                className={`login-input ${errors.password ? 'error' : ''}`}
                placeholder="Password"
                required
              />
              <div className="input-border"></div>
              <div className="input-icon">🔒</div>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

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
            className={`login-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="button-content">
                <div className="spinner"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="button-content">
                <span>Sign In</span>
                <div className="button-glow"></div>
              </div>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            Don't have an account? 
            <button className="link-button" onClick={() => onClose && onClose()}>
              Register
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

export default Login; 