"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";

const C = {
  cream:     "#FBF6EF",
  beige:     "#F1E4D3",
  beigeDeep: "#E2CDB0",
  tan:       "#D2B48C",
  caramel:   "#B8895E",
  coffee:    "#8B5E3C",
  coffeeDark:"#6B4226",
  espresso:  "#4A2E1E",
  gold:      "#B5894A",
  goldLight: "#DCC396",
  text:      "#3D2B1F",
  textMid:   "#6B4F3A",
  textLight: "#9C7F60",
};

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.user.role !== "admin") throw new Error("Admin access required");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(135deg, ${C.cream} 0%, ${C.beige} 50%, ${C.beigeDeep} 100%)`,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "20px",
    }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "48px",
        maxWidth: "420px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(74,46,30,0.12)",
        border: `1px solid ${C.beigeDeep}`,
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.12em", color: C.espresso, marginBottom: 4 }}>
            gleamwave
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: C.gold, textTransform: "uppercase", marginBottom: 20 }}>
            Admin Panel
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: C.espresso, margin: "0 0 6px" }}>
            Admin Login
          </h1>
          <p style={{ color: C.textLight, fontSize: "14px", margin: 0 }}>
            Enter your admin credentials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: C.textMid, marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="admin@gleamwave.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "12px",
                border: `1.5px solid ${C.beigeDeep}`, fontSize: "14px",
                fontFamily: "inherit", outline: "none",
                backgroundColor: C.beige, color: C.text,
                transition: "border-color 0.2s", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = C.coffee}
              onBlur={e => e.target.style.borderColor = C.beigeDeep}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: C.textMid, marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "12px",
                border: `1.5px solid ${C.beigeDeep}`, fontSize: "14px",
                fontFamily: "inherit", outline: "none",
                backgroundColor: C.beige, color: C.text,
                transition: "border-color 0.2s", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = C.coffee}
              onBlur={e => e.target.style.borderColor = C.beigeDeep}
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: C.beige, color: C.espresso,
              padding: "10px 14px", borderRadius: "10px",
              fontSize: "13px", border: `1px solid ${C.caramel}`,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px",
              border: "none", backgroundColor: C.coffee, color: "#fff",
              fontSize: "15px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              opacity: loading ? 0.7 : 1, marginTop: 4,
            }}
            onMouseEnter={e => { if (!loading) e.target.style.backgroundColor = C.espresso; }}
            onMouseLeave={e => { e.target.style.backgroundColor = C.coffee; }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <a href="/" style={{ color: C.textLight, fontSize: "13px", textDecoration: "underline" }}>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}