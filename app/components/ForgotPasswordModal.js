"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "@/lib/config";

export default function ForgotPasswordModal({ isOpen, onClose, onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setSuccess("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      
      setSuccess("OTP verified!");
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          otp, 
          new_password: newPassword, 
          confirm_password: confirmPassword 
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      
      setSuccess("Password reset successfully!");
      setTimeout(() => {
        onClose();
        if (onBack) onBack();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      
      setSuccess("OTP resent to your email!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "24px",
        padding: "40px",
        maxWidth: "420px",
        width: "100%",
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "20px",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "28px",
            cursor: "pointer",
            color: "#6B4F3A",
            opacity: 0.6,
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#4A2E22", marginBottom: "8px", fontFamily: "'Georgia', serif" }}>
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
          </h2>
          <p style={{ fontSize: "14px", color: "#A08070", marginBottom: "24px" }}>
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Enter your new password"}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: "#D1FAE5",
            color: "#059669",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "16px",
          }}>
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "#6B4F3A", display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#A08070" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    borderRadius: "12px",
                    border: "2px solid #E8D5BF",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: "#FDF8F3",
                  }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#4A2E22",
                color: "#E8D9C0",
                fontSize: "16px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "#6B4F3A", display: "block", marginBottom: "6px" }}>
                Enter 6-Digit OTP
              </label>
              <div style={{ position: "relative" }}>
                <FontAwesomeIcon icon={faKey} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#A08070" }} />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    borderRadius: "12px",
                    border: "2px solid #E8D5BF",
                    fontSize: "24px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: "#FDF8F3",
                    textAlign: "center",
                    letterSpacing: "8px",
                  }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#4A2E22",
                color: "#E8D9C0",
                fontSize: "16px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                marginBottom: "12px",
              }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "transparent",
                color: "#6F4E37",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
              }}
              disabled={loading}
            >
              Resend OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "#6B4F3A", display: "block", marginBottom: "6px" }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "2px solid #E8D5BF",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                  backgroundColor: "#FDF8F3",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "#6B4F3A", display: "block", marginBottom: "6px" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "2px solid #E8D5BF",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                  backgroundColor: "#FDF8F3",
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#4A2E22",
                color: "#E8D9C0",
                fontSize: "16px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
                setError("");
                setSuccess("");
              } else {
                onClose();
                if (onBack) onBack();
              }
            }}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#6B4F3A",
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "8px" }} />
            {step > 1 ? "Back" : "Back to Login"}
          </button>
        </div>
      </div>
    </div>
  );
}