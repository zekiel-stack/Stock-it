import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineKey,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

const SignIn = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("worker");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    secretKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
  
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const ADMIN_SECRET_KEY = "admin"; 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { email, password, secretKey } = formData;

    try {
      if (role === "admin" && secretKey !== ADMIN_SECRET_KEY) {
        throw new Error("Invalid admin secret key.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("Login failed. Please check credentials.");

      if (role === "worker") navigate("/worker");
      else if (role === "admin") navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const RoleToggle = () => (
    <div className="flex bg-gray-100 p-1 rounded-lg text-sm font-medium">
      <button
        type="button"
        className={`flex-1 flex items-center justify-center py-2 rounded-lg transition duration-150 ${
          role === "worker"
            ? "bg-white shadow text-gray-800"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setRole("worker")}
      >
        <HiOutlineUser className="w-5 h-5 mr-1" />
        Worker
      </button>
      <button
        type="button"
        className={`flex-1 flex items-center justify-center py-2 rounded-lg transition duration-150 ${
          role === "admin"
            ? "bg-white shadow text-gray-800"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setRole("admin")}
      >
        <HiOutlineShieldCheck className="w-5 h-5 mr-1" />
        Admin
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div
        className={`w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl transform transition-transform duration-500 ease-out ${
          animate ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mb-4">
            <HiOutlineLockClosed className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Sign In to Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Access your inventory management system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <RoleToggle />

          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <HiOutlineEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <HiOutlineKey className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {role === "admin" && (
            <div className="relative">
              <input
                type="password"
                name="secretKey"
                value={formData.secretKey}
                onChange={handleInputChange}
                placeholder="Enter Admin Secret Key"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
          >
            {loading
              ? "Signing In..."
              : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm text-center mt-3">{error}</p>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?
          <Link to="/signup" className="text-indigo-600 hover:underline ml-1">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
