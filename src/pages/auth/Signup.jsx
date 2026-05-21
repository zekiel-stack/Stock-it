import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    HiOutlineLockClosed, 
    HiOutlineUser,
    HiOutlineEnvelope, 
    HiOutlineKey,
    HiOutlineShieldCheck 
} from 'react-icons/hi2';
import { supabase } from '../../supabaseClient';

const SignUp = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('worker');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [animate, setAnimate] = useState(false); // animation state

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    // Trigger slide-in animation on mount
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      const { error: userError } = await supabase
        .from('users')
        .insert([{ name: formData.fullName, email: formData.email, role: role }]);

      if (userError) throw userError;

      setMessage('Signup successful! Please check your email to confirm your account.');
      setFormData({ fullName: '', email: '', password: '' });
      setRole('worker');

      setTimeout(() => navigate('/signin'), 2000);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const RoleToggle = () => (
    <div className="flex bg-gray-100 p-1 rounded-lg text-sm font-medium">
      <button
        className={`flex-1 flex items-center justify-center py-2 rounded-lg transition duration-150 ${
          role === 'worker' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setRole('worker')}
      >
        <HiOutlineUser className="w-5 h-5 mr-1" />
        Worker
      </button>
      <button
        className={`flex-1 flex items-center justify-center py-2 rounded-lg transition duration-150 ${
          role === 'admin' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setRole('admin')}
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
          animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mb-4">
            <HiOutlineLockClosed className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join the Inventory Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RoleToggle />

          <div className="relative">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

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
              placeholder="Create a secure password"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <HiOutlineKey className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
          >
            {loading ? 'Signing Up...' : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? 
          <Link to="/signin" className="text-indigo-600 hover:underline ml-1">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
