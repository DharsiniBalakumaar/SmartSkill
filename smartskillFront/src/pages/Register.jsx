// src/components/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css"; // keep global css

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password match
    if (form.password !== form.confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.fullname,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // ✅ Redirect immediately on successful registration
        navigate("/login");
      } else {
        // Show backend message (e.g., email exists)
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("❌ Something went wrong");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
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

      {/* Register Form */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </h2>

          <form
            className="space-y-4"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              value={form.fullname}
              onChange={handleChange}
              autoComplete="new-name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="new-email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />

            <button
              type="submit"
              className="w-full py-2 font-semibold text-white bg-blue-500 rounded-lg transition duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500"
            >
              Register
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-red-500">{message}</p>
          )}

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
