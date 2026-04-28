import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
        <button style={styles.button} type="submit">Register</button>
        <p>Already have an account? <span style={styles.link} onClick={onSwitch}>Login</span></p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 400, margin: "80px auto", padding: 32, border: "1px solid #ddd", borderRadius: 8 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "10px 14px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14 },
  button: { padding: "10px 14px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15 },
  error: { color: "red", fontSize: 13 },
  link: { color: "#1a1a2e", cursor: "pointer", textDecoration: "underline" },
};
