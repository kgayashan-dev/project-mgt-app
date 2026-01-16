"use client";
import { useState, useEffect } from "react";


interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  timeZone: string;
  timeFormat: string;
  language: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    timeZone: "(UTC+5:30) Asia - Colombo",
    timeFormat: "12 hour",
    language: "English (United States)",
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'credentials'>('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/project_pulse/Auth/profile`, {
        withCredentials: true
      });
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          username: userData.username || ""
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const response = await axios.put(
        `${API_URL}/project_pulse/Auth/update-profile`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update user data with new info
        if (response.data.user) {
          setUser(response.data.user);
        }
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update profile' });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating profile' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCredentialsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsUpdating(false);
      return;
    }

    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setIsUpdating(false);
      return;
    }

    try {
      const updateData: any = {};
      
      // Only include username if it's different from current
      if (formData.username && formData.username !== user?.username) {
        updateData.newUsername = formData.username;
      }
      
      // Only include password if it's being changed
      if (passwordData.newPassword) {
        updateData.currentPassword = passwordData.currentPassword;
        updateData.newPassword = passwordData.newPassword;
        updateData.confirmPassword = passwordData.confirmPassword;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'error', text: 'No changes detected' });
        setIsUpdating(false);
        return;
      }

      const response = await axios.put(
        'http://localhost:5258/project_pulse/Auth/update-credentials',
        updateData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message || 'Credentials updated successfully!' });
        
        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Update user data
        if (response.data.user) {
          setUser(response.data.user);
          setFormData(prev => ({
            ...prev,
            username: response.data.user.username
          }));
        }
        
        // Hide password form
        setShowPasswordForm(false);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update credentials' });
      }
    } catch (error: any) {
      console.error('Error updating credentials:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating credentials' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUsernameOnlyUpdate = async () => {
    if (!formData.username || formData.username === user?.username) {
      setMessage({ type: 'error', text: 'Please enter a new username' });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      const response = await axios.put(
        'http://localhost:5258/project_pulse/Auth/update-username',
        { newUsername: formData.username },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Username updated successfully!' });
        if (response.data.user) {
          setUser(response.data.user);
        }
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update username' });
      }
    } catch (error: any) {
      console.error('Error updating username:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating username' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-navy-900">Account Profile</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-2 rounded-md ${activeTab === 'credentials' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Credentials
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Photo Section */}
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
          <span className="text-lg text-gray-600">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </span>
        </div>
        <button className="text-blue-500 hover:text-blue-600">
          Upload Photo
        </button>
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleProfileChange}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleUsernameOnlyUpdate}
                disabled={isUpdating || formData.username === user?.username}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update Username
              </button>
            </div>
          </div>

          <h2 className="text-lg font-bold text-navy-900 pt-4">Preferences</h2>

          {/* Time Zone */}
          <div>
            <label
              htmlFor="timeZone"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Time Zone
            </label>
            <select
              id="timeZone"
              name="timeZone"
              value={formData.timeZone}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="(UTC+5:30) Asia - Colombo">
                (UTC+5:30) Asia - Colombo
              </option>
            </select>
          </div>

          {/* Time Format */}
          <div>
            <label
              htmlFor="timeFormat"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Time Format
            </label>
            <select
              id="timeFormat"
              name="timeFormat"
              value={formData.timeFormat}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="12 hour">12 hour</option>
              <option value="24 hour">24 hour</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="language"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="English (United States)">
                English (United States)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Username Update */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Update Username</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="New username"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleUsernameOnlyUpdate}
                disabled={isUpdating || !formData.username || formData.username === user?.username}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Current username: <span className="font-semibold">{user?.username}</span>
            </p>
          </div>

          {/* Password Update */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Update Password</h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-blue-500 hover:text-blue-600"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handleCredentialsUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>

          {/* Combined Update */}
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Update Both Username & Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              You can update both your username and password in a single request. Fill in the fields you want to change.
            </p>
            
            <form onSubmit={handleCredentialsUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Username (optional)
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty to keep current"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Current Password (required for password change)
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Required if changing password"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm if changing password"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Credentials'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}