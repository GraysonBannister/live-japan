'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useCurrency } from '../components/CurrencyProvider';
import { CURRENCY_DETAILS, SupportedCurrency } from '../lib/currency';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const currencyContext = useCurrency();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences state
  const [preferredCurrency, setPreferredCurrency] = useState<SupportedCurrency>(currencyContext?.currency || 'JPY');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
      setPreferredCurrency(currencyContext?.currency || 'JPY');
    }
  }, [user, currencyContext]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        email: email !== user?.email ? email : undefined,
        data: { full_name: fullName }
      });

      if (error) throw error;
      
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Update currency preference
      if (currencyContext) {
        currencyContext.setCurrency(preferredCurrency as any);
      }

      // Store preferences in user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          preferences: {
            currency: preferredCurrency,
            emailNotifications,
            marketingEmails
          }
        }
      });

      if (error) throw error;
      
      setMessage('Preferences saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2416]">Settings / 設定</h1>
          <p className="text-[#78716C] mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E7E5E4] mb-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-[#3F51B5] text-[#3F51B5]'
                  : 'border-transparent text-[#78716C] hover:text-[#2C2416]'
              }`}
            >
              Profile / プロフィール
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-[#3F51B5] text-[#3F51B5]'
                  : 'border-transparent text-[#78716C] hover:text-[#2C2416]'
              }`}
            >
              Preferences / 設定
            </button>
          </nav>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E7E5E4] p-6">
              <h2 className="text-lg font-semibold text-[#2C2416] mb-4">Profile Information / プロフィール情報</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-[#2C2416] mb-1">
                    Full Name / 名前
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] text-[#2C2416]"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#2C2416] mb-1">
                    Email Address / メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] text-[#2C2416]"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#3F51B5] text-white font-medium rounded-lg hover:bg-[#283593] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Profile / 保存'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E7E5E4] p-6">
              <h2 className="text-lg font-semibold text-[#2C2416] mb-4">Change Password / パスワード変更</h2>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-[#2C2416] mb-1">
                    New Password / 新しいパスワード
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] text-[#2C2416]"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2C2416] mb-1">
                    Confirm New Password / パスワード確認
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] text-[#2C2416]"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#3F51B5] text-white font-medium rounded-lg hover:bg-[#283593] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update Password / 更新'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E5E4] p-6">
            <h2 className="text-lg font-semibold text-[#2C2416] mb-4">Preferences / 設定</h2>
            
            <form onSubmit={handleUpdatePreferences} className="space-y-6">
              {/* Currency Preference */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-[#2C2416] mb-2">
                  Preferred Currency / 通貨
                </label>
                <select
                  id="currency"
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value as SupportedCurrency)}
                  className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] text-[#2C2416]"
                >
                  {Object.entries(CURRENCY_DETAILS || {}).map(([code, details]) => (
                    <option key={code} value={code}>
                      {details.flag} {code} - {details.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#78716C] mt-1">
                  This will be your default currency across the site
                </p>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between py-3 border-t border-[#E7E5E4]">
                <div>
                  <h3 className="text-sm font-medium text-[#2C2416]">Email Notifications / メール通知</h3>
                  <p className="text-xs text-[#78716C]">Receive updates about your saved properties</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3F51B5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51B5]"></div>
                </label>
              </div>

              {/* Marketing Emails */}
              <div className="flex items-center justify-between py-3 border-t border-[#E7E5E4]">
                <div>
                  <h3 className="text-sm font-medium text-[#2C2416]">Marketing Emails / マーケティングメール</h3>
                  <p className="text-xs text-[#78716C]">Receive news and special offers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3F51B5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51B5]"></div>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#3F51B5] text-white font-medium rounded-lg hover:bg-[#283593] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Preferences / 設定を保存'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link 
            href="/" 
            className="text-[#3F51B5] hover:text-[#283593] text-sm font-medium"
          >
            ← Back to Listings / 物件一覧に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
