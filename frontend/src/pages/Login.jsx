import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true); setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) { setError(err.response?.data?.message || "Login failed"); } finally { setSubmitting(false); }
  }

  return <AuthForm disabled={submitting} title="Welcome back" error={error} form={form} setForm={setForm} submit={submit} button={submitting ? "Logging in..." : "Login"} footer={<Link to="/register" className="text-emerald-700 font-bold">Create an account</Link>} />;
}

function AuthForm({ title, error, form, setForm, submit, button, footer, disabled }) {
  return <section className="container-page py-20 max-w-md">
    <div className="card p-8">
      <p className="eyebrow">WAWECAPE ACCOUNT</p><h1 className="text-3xl font-black">{title}</h1>
      <form onSubmit={submit} className="space-y-4 mt-7">
        <label>Email<input required type="email" maxLength={180} value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></label>
        <label>Password<input required type="password" maxLength={72} value={form.password} onChange={e => setForm({...form,password:e.target.value})} /></label>
        {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
        <button disabled={disabled} className="btn-primary w-full justify-center">{button}</button>
      </form>
      <div className="mt-5 text-sm text-center">{footer}</div>
    </div>
  </section>;
}
