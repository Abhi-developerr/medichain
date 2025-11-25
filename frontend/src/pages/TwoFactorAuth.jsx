import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Shield, Check, X, Lock, Smartphone, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TwoFactorAuth() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/2fa/enable');
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShowSetup(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/2fa/verify', { token });
      toast.success(data.message);
      setShowSetup(false);
      setToken('');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid token');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/2fa/disable', { token, password });
      toast.success(data.message);
      setShowDisable(false);
      setToken('');
      setPassword('');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      <main className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Two-Factor Authentication
              </h1>
              <p className="text-gray-600 mt-2">Enhance your account security with 2FA</p>
            </div>

            {/* Status Card */}
            <div className="glass-effect rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {user?.twoFactorEnabled ? (
                    <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {user?.twoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                    </h3>
                    <p className="text-gray-600">
                      {user?.twoFactorEnabled 
                        ? 'Your account is protected with two-factor authentication' 
                        : 'Enable 2FA to add an extra layer of security'}
                    </p>
                  </div>
                </div>
                
                {!user?.twoFactorEnabled ? (
                  <button
                    onClick={handleEnable2FA}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    Enable 2FA
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDisable(true)}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Disable 2FA
                  </button>
                )}
              </div>
            </div>

            {/* Setup Instructions */}
            {showSetup && (
              <div className="glass-effect rounded-2xl p-8 mb-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                  Setup Two-Factor Authentication
                </h2>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Step 1: Install an Authenticator App</h3>
                    <p className="text-gray-600 mb-3">Download and install one of these authenticator apps:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Google Authenticator (iOS/Android)</li>
                      <li>Microsoft Authenticator (iOS/Android)</li>
                      <li>Authy (iOS/Android/Desktop)</li>
                    </ul>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Step 2: Scan the QR Code</h3>
                    <div className="bg-white p-6 rounded-xl inline-block">
                      {qrCode && <img src={qrCode} alt="QR Code" className="h-64 w-64" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">Or manually enter this code: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code></p>
                  </div>

                  {/* Step 3 */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Step 3: Verify with Code</h3>
                    <form onSubmit={handleVerify2FA} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter the 6-digit code from your app
                        </label>
                        <input
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={loading || token.length !== 6}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                        >
                          {loading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSetup(false);
                            setToken('');
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Disable Form */}
            {showDisable && (
              <div className="glass-effect rounded-2xl p-8 mb-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-red-600" />
                  Disable Two-Factor Authentication
                </h2>
                
                <form onSubmit={handleDisable2FA} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2FA Code
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || token.length !== 6}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDisable(false);
                        setToken('');
                        setPassword('');
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                What is Two-Factor Authentication?
              </h3>
              <p className="text-blue-800 text-sm">
                Two-factor authentication (2FA) adds an extra layer of security to your account by requiring both your password 
                and a verification code from your phone to sign in. This helps protect your medical records even if someone knows your password.
              </p>
            </div>
          </div>
        </main>
    </div>
  );
}
