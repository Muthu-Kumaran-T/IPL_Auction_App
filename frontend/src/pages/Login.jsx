// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'contestant';

  const { login, register, loading, error, clearError } = useAuthStore();
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    clearError();
  }, [isRegister, clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role
      });

      if (result.success) {
        navigate('/game-selection');
      }
    } else {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        navigate('/game-selection');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full max-w-[95vw] sm:max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-white mb-4 sm:mb-6 hover:text-white/80 transition-colors text-sm sm:text-base min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              {role === 'auctioneer' ? '🎤 Auctioneer' : '🏏 Contestant'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 leading-tight">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {isRegister ? 'Register to get started' : 'Login to continue'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4">
              <p className="font-semibold mb-1 text-sm">Registration Failed:</p>
              <p className="text-sm text-xs sm:text-sm">{error}</p>
              <p className="text-xs mt-1 sm:mt-2 text-red-600">Check browser console (F12) for more details</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                  placeholder="Enter username"
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="Enter password"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                  placeholder="Confirm password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 text-sm sm:text-base min-h-[48px]"
            >
              {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium min-h-[36px]"
              type="button"
            >
              {isRegister
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
