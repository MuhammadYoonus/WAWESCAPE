import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/");
    } catch (err) { setError(err.response?.data?.message || "Registration failed"); }
  }

  return <section className="container-page py-20 max-w-md">
    <div className="card p-8">
      <p className="eyebrow">JOIN WAWECAPE</p><h1 className="text-3xl font-black">Create your account</h1>
      <form onSubmit={submit} className="space-y-4 mt-7">
        <label>Full name<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></label>
        <label>Email<input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></label>
        <label>Password<input required minLength="6" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} /></label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="btn-primary w-full justify-center">Create account</button>
      </form>
      <div className="mt-5 text-sm text-center">Already registered? <Link to="/login" className="text-emerald-700 font-bold">Login</Link></div>
    </div>
  </section>;
}
