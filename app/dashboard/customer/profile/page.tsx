"use client";

import React, { useEffect, useState } from "react";
import { Edit2, Plus, Eye, Trash2 } from "lucide-react";
import Button from "@/components/UI/Button";
import {
  addVehicle,
  deleteVehicle,
  getProfile,
  getSettings,
  getVehicles,
  toApiErrorMessage,
  updateProfile,
  updateSettings,
  type CustomerProfile,
  type CustomerSettings,
  type Vehicle,
} from "@/lib/customer-api";

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile>({
    firstName: "",
    secondName: "",
    email: "",
    phoneNumber: "",
  });
  const [settings, setSettings] = useState<CustomerSettings>({
    notificationsOn: true,
    language: "English",
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState({ brand: "", plateNumber: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [vehiclesError, setVehiclesError] = useState("");
  const languageOptions = ["English", "Sinhala", "Tamil"];

  const loadVehicles = async () => {
    const data = await getVehicles();
    setVehicles(data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, settingsData] = await Promise.all([
          getProfile(),
          getSettings(),
        ]);
        setProfile({
          firstName: profileData?.firstName ?? "",
          secondName: profileData?.secondName ?? "",
          email: profileData?.email ?? "",
          phoneNumber: profileData?.phoneNumber ?? "",
        });
        setSettings({
          notificationsOn: Boolean(settingsData?.notificationsOn),
          language: settingsData?.language ?? "English",
        });
      } catch (error) {
        const message = toApiErrorMessage(error);
        setProfileError(message);
        setSettingsError(message);
      }

      try {
        await loadVehicles();
      } catch (error) {
        setVehiclesError(toApiErrorMessage(error));
      }
    };

    loadData();
  }, []);

  const handleProfileSave = async () => {
    setProfileError("");
    try {
      const updated = await updateProfile(profile);
      setProfile({
        firstName: updated?.firstName ?? "",
        secondName: updated?.secondName ?? "",
        email: updated?.email ?? "",
        phoneNumber: updated?.phoneNumber ?? "",
      });
    } catch (error) {
      setProfileError(toApiErrorMessage(error));
    }
  };

  const handleSettingsSave = async () => {
    setSettingsError("");
    try {
      const updated = await updateSettings(settings);
      setSettings({
        notificationsOn: Boolean(updated?.notificationsOn),
        language: updated?.language ?? "English",
      });
    } catch (error) {
      setSettingsError(toApiErrorMessage(error));
    }
  };

  const handleVehicleAdd = async () => {
    if (!newVehicle.brand.trim() || !newVehicle.plateNumber.trim()) return;
    setVehiclesError("");
    try {
      await addVehicle({
        brand: newVehicle.brand.trim(),
        plateNumber: newVehicle.plateNumber.trim(),
        imageUrl: null,
      });
      setNewVehicle({ brand: "", plateNumber: "" });
      await loadVehicles();
    } catch (error) {
      setVehiclesError(toApiErrorMessage(error));
    }
  };

  const handleVehicleDelete = async (id: string) => {
    setVehiclesError("");
    try {
      await deleteVehicle(id);
      await loadVehicles();
    } catch (error) {
      setVehiclesError(toApiErrorMessage(error));
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      <div className="flex items-center gap-8 mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=128" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">
            {`${profile.firstName || "Customer"} ${profile.secondName || ""}`.trim()}
          </h2>
          <p className="text-slate-500 text-sm font-medium">{profile.email || "-"}</p>
          <p className="text-slate-500 text-sm font-medium">{profile.phoneNumber || "-"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        
        <div className="space-y-8">
          
          
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Payment Method</h3>
              <button className="text-orange-500"><Plus size={18} /></button>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 flex items-center justify-between border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-5 bg-red-500 rounded-sm" /> 
                  <span className="text-sm font-medium text-slate-600">*********7852</span>
                </div>
                <Edit2 size={14} className="text-slate-400 cursor-pointer" />
              </div>
              <div className="flex-1 flex items-center justify-between border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-5 bg-blue-600 rounded-sm" /> 
                  <span className="text-sm font-medium text-slate-600">*********5248</span>
                </div>
                <Edit2 size={14} className="text-slate-400 cursor-pointer" />
              </div>
            </div>
          </section>

          
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <h3 className="font-bold text-slate-800 mb-6">Personal Information</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Second Name</label>
                <input
                  type="text"
                  value={profile.secondName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, secondName: e.target.value }))}
                  className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">E-Mail</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              {profileError && (
                <p className="text-sm text-red-600">{profileError}</p>
              )}
              <div className="pt-4">
                <Button
                  onClick={handleProfileSave}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold shadow-md shadow-orange-200"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </section>
        </div>

        
        <div className="space-y-8">
          
          
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <h3 className="font-bold text-orange-500 mb-6">Platform Settings</h3>
            
            <div className="space-y-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</div>
              
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Notification</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notificationsOn}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, notificationsOn: !prev.notificationsOn }))
                  }
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 ${settings.notificationsOn ? "bg-orange-500" : "bg-slate-200"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${settings.notificationsOn ? "left-6" : "left-1"}`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-600 min-w-[4rem]">
                  {settings.notificationsOn ? "On" : "Off"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Language</label>
                <select
                  value={settings.language || "English"}
                  onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
                  className="w-full border-b border-slate-200 pb-2 text-sm text-slate-600 font-medium bg-transparent focus:outline-none"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Current password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none" 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <Eye size={16} />
                </button>
              </div>
              {settingsError && (
                <p className="text-sm text-red-600">{settingsError}</p>
              )}
              <Button
                onClick={handleSettingsSave}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold shadow-md shadow-orange-200"
              >
                Save Settings
              </Button>
            </div>
          </section>

          
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-6">My Vehicles</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="border border-slate-100 rounded-xl overflow-hidden group hover:border-orange-100 transition-all"
                >
                  <div className="h-24 bg-slate-100 relative">
                    <img
                      src={
                        vehicle.imageUrl ||
                        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200"
                      }
                      alt={vehicle.brand}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{vehicle.brand}</p>
                      <p className="text-[10px] text-slate-500">{vehicle.plateNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVehicleDelete(vehicle.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Vehicle brand"
                value={newVehicle.brand}
                onChange={(e) => setNewVehicle((prev) => ({ ...prev, brand: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none"
              />
              <input
                type="text"
                placeholder="Plate number"
                value={newVehicle.plateNumber}
                onChange={(e) => setNewVehicle((prev) => ({ ...prev, plateNumber: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none"
              />
            </div>
            {vehiclesError && (
              <p className="text-sm text-red-600 mb-3">{vehiclesError}</p>
            )}
            <button
              type="button"
              onClick={handleVehicleAdd}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-colors text-slate-600 text-sm font-bold"
            >
              <Plus size={16} />
              Add Vehicle
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}

