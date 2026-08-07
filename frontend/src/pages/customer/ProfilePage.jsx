import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../services/authApi';
import { User, Phone, MapPin, Lock, Camera, Map, Check, Trash2, Plus } from 'lucide-react';

const PREDEFINED_LOCATIONS = [
  { name: 'Connaught Place, New Delhi', address: 'Block H, Connaught Place, New Delhi, Delhi 110001' },
  { name: 'Bandra West, Mumbai', address: '88 Food Court Street, Bandra West, Mumbai, Maharashtra 400050' },
  { name: 'Indiranagar, Bengaluru', address: '12 Galleria Boulevard, MG Road, Indiranagar, Bengaluru, Karnataka 560008' },
  { name: 'Sector 18, Noida', address: '29 Lotus Plaza, Sector 18, Noida, Uttar Pradesh 201301' }
];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile'); // profile, location, password
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Address state
  const [address, setAddress] = useState(user?.address || '');
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem(`quickbite_saved_addresses_${user?.id}`);
    return saved ? JSON.parse(saved) : [
      { id: '1', label: 'Home', address: user?.address || 'Flat 402, Sunshine Apartments, MG Road, Bengaluru' },
      { id: '2', label: 'Work', address: 'Tech Park phase-2, Outer Ring Road, Bengaluru' }
    ];
  });
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressText, setNewAddressText] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const saveAddressesToStorage = (updated) => {
    setSavedAddresses(updated);
    localStorage.setItem(`quickbite_saved_addresses_${user?.id}`, JSON.stringify(updated));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await authApi.updateProfile({ name, phone, avatar, address });
      updateUser(updatedUser);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = async (locAddress) => {
    setAddress(locAddress);
    // Persist active address immediately
    try {
      const updatedUser = await authApi.updateProfile({ name, phone, avatar, address: locAddress });
      updateUser(updatedUser);
      showToast('Default delivery location updated!', 'success');
    } catch (err) {
      showToast('Failed to update address on server', 'error');
    }
  };

  const runSimulatedGPS = () => {
    setLoading(true);
    setTimeout(async () => {
      const randomLoc = PREDEFINED_LOCATIONS[Math.floor(Math.random() * PREDEFINED_LOCATIONS.length)];
      setAddress(randomLoc.address);
      try {
        const updatedUser = await authApi.updateProfile({ name, phone, avatar, address: randomLoc.address });
        updateUser(updatedUser);
        showToast(`Simulated GPS located address: ${randomLoc.name}`, 'success');
      } catch (err) {
        showToast('Failed to save GPS location', 'error');
      }
      setLoading(false);
    }, 1000);
  };

  const handleSimulateGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser. Using simulated location.', 'warning');
      runSimulatedGPS();
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'QuickBite Food Ordering System'
              }
            }
          );
          if (!response.ok) throw new Error('Geocoding request failed');
          const data = await response.json();
          const detectedAddress = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setAddress(detectedAddress);
          const updatedUser = await authApi.updateProfile({ name, phone, avatar, address: detectedAddress });
          updateUser(updatedUser);
          showToast(`GPS located address: ${data.address?.road || data.address?.suburb || 'Detected Location'}`, 'success');
        } catch (err) {
          const fallbackAddress = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(fallbackAddress);
          try {
            const updatedUser = await authApi.updateProfile({ name, phone, avatar, address: fallbackAddress });
            updateUser(updatedUser);
            showToast('GPS coordinates captured, but failed to fetch address details.', 'warning');
          } catch (serverErr) {
            showToast('Failed to save location', 'error');
          }
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        let msg = 'Failed to detect GPS location. Using simulated location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access denied. Using simulated location.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information unavailable. Using simulated location.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Using simulated location.';
        }
        showToast(msg, 'warning');
        runSimulatedGPS();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    const newAddr = {
      id: Date.now().toString(),
      label: newLabel,
      address: newAddressText
    };
    const updated = [...savedAddresses, newAddr];
    saveAddressesToStorage(updated);
    setNewAddressText('');
    setShowAddressForm(false);
    showToast('New address saved!', 'success');
  };

  const handleDeleteAddress = (id) => {
    const updated = savedAddresses.filter(addr => addr.id !== id);
    saveAddressesToStorage(updated);
    showToast('Address removed', 'success');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      showToast('Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage your profile details, delivery addresses, and credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-5 h-5" /> Profile Details
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'location'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-5 h-5" /> Delivery Location
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'password'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Lock className="w-5 h-5" /> Security
          </button>
        </div>

        {/* Form Area */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
            
            {/* Tab 1: Profile Info */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h3>
                
                {/* Avatar Section */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <img
                      src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                      alt={name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-brand-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomSeed = Math.floor(Math.random() * 1000);
                        setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
                      }}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-brand-500 text-white shadow-md hover:bg-brand-600 transition"
                      title="Generate new avatar"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{name || 'Your Avatar'}</h4>
                    <p className="text-xs text-gray-400">Click camera button to generate a new custom avatar</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-400">Email Address (Read-only)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-950 text-gray-400 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile Details'}
                </button>
              </form>
            )}

            {/* Tab 2: Location & Addresses */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Location</h3>
                  <p className="text-xs text-gray-400 mt-1">Configure default address for delivery and check out.</p>
                </div>

                {/* Simulated GPS */}
                <div className="p-4 bg-gradient-to-r from-brand-500/10 to-amber-500/10 border border-brand-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-500 text-white rounded-xl shadow-md">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Auto-Detect GPS Location</h4>
                      <p className="text-xs text-gray-500">Fast simulated lookup based on nearest delivery coordinates.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateGPS}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Detecting...' : 'Detect Coordinates'}
                  </button>
                </div>

                {/* Predefined Quick Choose */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quick Locations Available</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PREDEFINED_LOCATIONS.map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => handleSelectLocation(loc.address)}
                        className={`p-3 text-left border rounded-xl text-xs transition-all flex justify-between items-center ${
                          address === loc.address
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 font-bold'
                            : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{loc.name}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[200px] mt-0.5">{loc.address}</p>
                        </div>
                        {address === loc.address && <Check className="w-4 h-4 text-brand-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Address View */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Selected Active Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Set address here..."
                  />
                  <button
                    onClick={() => handleSelectLocation(address)}
                    className="mt-2 text-xs font-bold text-brand-500 hover:underline"
                  >
                    Update Server Profile Default Address
                  </button>
                </div>

                <hr className="border-gray-100 dark:border-slate-700" />

                {/* Saved Addresses list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Your Saved Book Addresses</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-xs text-brand-500 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="p-4 border border-gray-100 dark:border-slate-700 rounded-2xl bg-gray-50/50 dark:bg-slate-900/40 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {['Home', 'Work', 'Other'].map(label => (
                          <button
                            type="button"
                            key={label}
                            onClick={() => setNewLabel(label)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                              newLabel === label
                                ? 'bg-brand-500 text-white'
                                : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        required
                        value={newAddressText}
                        onChange={(e) => setNewAddressText(e.target.value)}
                        placeholder="Flat No, Tower, Street, Pincode"
                        rows={2}
                        className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-bold bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="flex justify-between items-center p-3.5 border border-gray-100 dark:border-slate-700 rounded-2xl bg-gray-50/50 dark:bg-slate-900/20 hover:border-gray-200 dark:hover:border-slate-600 transition">
                        <div>
                          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase bg-brand-100 text-brand-600 rounded-md dark:bg-brand-950/40">{addr.label}</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{addr.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSelectLocation(addr.address)}
                            className="p-2 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-white dark:hover:bg-slate-800 transition"
                            title="Select as Delivery Address"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Security / Password */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Change Credentials</h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Old Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
