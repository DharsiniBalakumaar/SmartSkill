import { useState } from "react";
import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams(); // get token from URL
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Password reset successful! You can now log in.");
        setNewPassword("");
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700"></label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500"
          >
            Reset Password
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
