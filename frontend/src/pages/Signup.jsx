import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    cityId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    mobile: '',
    agreedTos: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpData, setOtpData] = useState({ email: '', firstName: '', lastName: '' });

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCitiesLoading(true);
        const response = await fetch(API_ENDPOINTS.CITIES);
        if (response.ok) {
          const data = await response.json();
          setCities(data.cities || []);
          console.log('🏙️ Fetched cities:', data.cities?.length || 0);
        } else {
          console.error('Failed to fetch cities:', response.status);
          setError('Failed to load cities. Please refresh the page.');
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setError('Failed to load cities. Please check your connection.');
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Enhanced validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      setLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      setLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!formData.mobile.trim()) {
      setError('Mobile number is required');
      setLoading(false);
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    if (!formData.dob) {
      setError('Date of birth is required');
      setLoading(false);
      return;
    }

    if (!formData.cityId) {
      setError('Please select your city');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one letter, one number, and one special character');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.agreedTos) {
      setError('You must agree to the Terms of Service');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 Starting signup process...');
      
      // Step 1: Validate signup data
      const validateResponse = await fetch(API_ENDPOINTS.SIGNUP_VALIDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          cityId: formData.cityId,
          firstName: formData.firstName.trim(),
          middleName: formData.middleName?.trim() || '',
          lastName: formData.lastName.trim(),
          dob: formData.dob,
          mobile: formData.mobile.trim(),
          agreedTos: formData.agreedTos
        }),
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok) {
        throw new Error(validateData.error || 'Validation failed');
      }

      console.log('✅ Validation successful, sending verification email...');

      // Step 2: Send verification email
      const verifyResponse = await fetch(API_ENDPOINTS.SIGNUP_VERIFY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          cityId: formData.cityId,
          firstName: formData.firstName.trim(),
          middleName: formData.middleName?.trim() || '',
          lastName: formData.lastName.trim(),
          dob: formData.dob,
          mobile: formData.mobile.trim(),
          agreedTos: formData.agreedTos
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Failed to send verification email');
      }

      console.log('✅ Verification email sent:', verifyData);

      // Show OTP verification modal
      setOtpData({ 
        email: formData.email, 
        firstName: formData.firstName, 
        lastName: formData.lastName,
        emailSent: verifyData.emailSent,
        developmentMode: verifyData.developmentMode,
        otpCode: verifyData.otpCode // Include OTP if email failed or in development mode
      });
      setShowOTPVerification(true);
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Signup error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join CityWatch
          </h2>
          <p className="text-gray-600">
            Create your account to start making a difference
          </p>
        </motion.div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                  Middle Name
                </label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Middle name (optional)"
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                maxLength="10"
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="cityId" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <select
                id="cityId"
                name="cityId"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.cityId}
                onChange={handleChange}
              >
                <option value="">Select your city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password (min 8 chars, 1 number, 1 special char)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <input
                id="agreedTos"
                name="agreedTos"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.agreedTos}
                onChange={handleChange}
              />
              <label htmlFor="agreedTos" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </a>
              </label>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <OTPVerification 
          email={otpData.email}
          firstName={otpData.firstName}
          lastName={otpData.lastName}
          onSuccess={(user, tokens) => {
            login(user, tokens);
            navigate('/dashboard');
          }}
          onClose={() => setShowOTPVerification(false)}
        />
      )}
    </div>
  );
};

// OTP Verification Component
const OTPVerification = ({ email, firstName, lastName, emailSent, developmentMode, otpCode: providedOtpCode, onSuccess, onClose }) => {
  const [otpCode, setOtpCode] = useState(providedOtpCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP_COMPLETE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      onSuccess(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP_VERIFY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      // Start cooldown timer
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verify Your Email
          </h3>
          {emailSent && !developmentMode ? (
            <p className="text-sm text-gray-600 mb-4">
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>
          ) : developmentMode ? (
            <div className="mb-4">
              <p className="text-sm text-blue-600 mb-2">
                🔧 Development Mode: Email service not configured
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Your verification code is: <strong className="text-lg text-blue-600">{providedOtpCode}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Check the server console for email details. Configure Gmail in .env file for production.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-yellow-600 mb-2">
                ⚠️ Email sending failed, but your account was created successfully.
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Your verification code is: <strong className="text-lg text-blue-600">{providedOtpCode}</strong>
              </p>
              <p className="text-xs text-gray-500">
                You can also try resending the email below.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="otpCode"
              type="text"
              maxLength="6"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendOTP}
            disabled={resendLoading || resendCooldown > 0}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading 
              ? 'Sending...' 
              : resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : 'Resend Code'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
