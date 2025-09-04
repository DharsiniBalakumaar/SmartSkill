import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Login successful!");
        // redirect to homepage after short delay
        setTimeout(() => navigate("/home"), 1000);
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("❌ Something went wrong");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ✅ Header (same as Register) */}
      <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 text-gray-900">
            <svg viewBox="0 0 48 48" fill="currentColor">
              <path d="M4 4H17.3V17.3H30.7V30.7H44V44H4V4Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">SmartSkill</h2>
        </div>

        <nav className="space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
          <Link to="/courses" className="text-gray-700 hover:text-blue-600">Courses</Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
        </nav>
      </header>

      {/* ✅ Login Form */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="new-email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            

            <button
              type="submit"
              className="w-full py-2 font-semibold text-white bg-blue-500 rounded-lg transition duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500"
            >
              Login
            </button>
          </form>

          {/* show backend message */}
          {message && (
            <p className="mt-4 text-center text-sm text-red-500">{message}</p>
          )}

          <div className="font-bold text-center mt-6">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

          {/* ✅ Register Link */}
          <p className="text-sm text-gray-600 mt-6 text-center">
            Don’t have an account?{" "}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
