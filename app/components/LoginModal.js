"use client";
import { useState } from 'react';
import { loginUser } from '@/lib/api';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to your Gleamwave account</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button 
            type="submit" 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <span style={styles.link} onClick={() => {
            onClose();
            // You can trigger signup modal here
          }}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6B4226',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#4A0D14',
    marginBottom: '8px',
    fontFamily: "'Georgia', serif",
  },
  subtitle: {
    fontSize: '14px',
    color: '#9C7060',
    marginBottom: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#3D2014',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #F5E8C8',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#FDF8F6',
  },
  error: {
    color: '#6B1A24',
    fontSize: '13px',
    backgroundColor: '#F5E0E0',
    padding: '10px 14px',
    borderRadius: '8px',
    marginTop: '4px',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#6B1A24',
    color: '#E8C86A',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    marginTop: '8px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6B4226',
    marginTop: '20px',
  },
  link: {
    color: '#6B1A24',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default LoginModal;