"use client";
import { useState } from 'react';
import { signupUser } from '@/lib/api';

const SignupModal = ({ isOpen, onClose, onSignupSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const data = await signupUser({
        name: fullName || firstName,
        email,
        password,
        phone,
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onSignupSuccess(data.user);
      onClose();
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Gleamwave family today</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email *</label>
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
            <label style={styles.label}>Phone (WhatsApp)</label>
            <input
              type="tel"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <span style={styles.link} onClick={() => {
            onClose();
            // You can trigger login modal here
          }}>Login</span>
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
    maxWidth: '480px',
    width: '100%',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxHeight: '90vh',
    overflowY: 'auto',
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
    gap: '16px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
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

export default SignupModal;