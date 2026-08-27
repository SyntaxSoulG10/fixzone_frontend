"use client";

import React, { useEffect, useState } from "react";
import {
  Camera,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  Car,
  CreditCard,
  Bell,
  Shield,
  Save,
  Check,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/UI/Button";
import ConfirmDialog from "@/components/UI/ConfirmDialog";
import {
  addVehicle,
  deleteVehicle,
  getProfile,
  getSettings,
  getVehicles,
  toApiErrorMessage,
  updateProfile,
  updateSettings,
  uploadProfilePicture,
  uploadVehicleImage,
  changePassword,
  type CustomerProfile,
  type CustomerSettings,
  type Vehicle,
} from "@/lib/customer-api";

/* ── tiny helpers ─────────────────────────────────────────── */

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  accent = "text-orange-600",
  accentBg = "bg-orange-50",
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  accent?: string;
  accentBg?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${accentBg} ${accent} rounded-xl flex items-center justify-center shrink-0`}>
            <Icon size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-none">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        <Icon size={11} />
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all";

/* ══════════════════════════════════════════════════════════ */
export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile>({
    firstName: "",
    secondName: "",
    email: "",
    phoneNumber: "",
    profilePictureUrl: "",
  });
  const [settings, setSettings] = useState<CustomerSettings>({
    language: "English",
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState({ brand: "", model: "", plateNumber: "", vehicleType: "CAR" as "CAR" | "BIKE" | "VAN" | "TRUCK" });
  const [newVehicleImageData, setNewVehicleImageData] = useState<string | null>(null);
  const [newVehicleImageName, setNewVehicleImageName] = useState<string>("");
  const [profileError, setProfileError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [vehiclesError, setVehiclesError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [vehicleAddedSuccess, setVehicleAddedSuccess] = useState(false);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [vehicleAdding, setVehicleAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; vehicleId: string }>({ open: false, vehicleId: "" });

  // Change Password state
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const pwHasLength = pwNew.length >= 8;
  const pwHasUpper = /[A-Z]/.test(pwNew);
  const pwHasLower = /[a-z]/.test(pwNew);
  const pwHasNumber = /[0-9]/.test(pwNew);
  const pwHasSpecial = /[^A-Za-z0-9]/.test(pwNew);

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
          profilePictureUrl: profileData?.profilePictureUrl ?? "",
        });
        setSettings({
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

  const handleProfileSave = async (customProfile?: CustomerProfile) => {
    const p = customProfile || profile;
    
    // Validation
    if (!p.firstName.trim() || !p.secondName.trim()) {
      setProfileError("First name and last name are required.");
      return;
    }
    if (p.phoneNumber && !/^\d{10}$/.test(p.phoneNumber.replace(/[\s-]/g, ''))) {
      setProfileError("Phone number must be exactly 10 digits.");
      return;
    }

    setProfileError("");
    setProfileSaved(false);
    try {
      // email is not updatable — strip it from the payload
      const { email: _email, ...profilePayload } = p;
      const updated = await updateProfile(profilePayload);
      const newProfile = {
        firstName: updated?.firstName ?? "",
        secondName: updated?.secondName ?? "",
        email: profile.email, // keep existing email in local state
        phoneNumber: updated?.phoneNumber ?? "",
        profilePictureUrl: updated?.profilePictureUrl ?? "",
      };
      setProfile(newProfile);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profileUpdated"));
      }
      return newProfile;
    } catch (error) {
      setProfileError(toApiErrorMessage(error));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const result = await uploadProfilePicture(base64String);
        setProfile((p) => ({ ...p, profilePictureUrl: result.profilePictureUrl }));
      } catch {
        // fallback: store base64 directly in profile
        const updatedProfile = { ...profile, profilePictureUrl: base64String };
        await handleProfileSave(updatedProfile);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSettingsSave = async () => {
    setSettingsError("");
    setSettingsSaved(false);
    try {
      const updated = await updateSettings(settings);
      setSettings({
        language: updated?.language ?? "English",
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (error) {
      setSettingsError(toApiErrorMessage(error));
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwCurrent.trim() || !pwNew.trim() || !pwConfirm.trim()) {
      setPwError("All password fields are required.");
      return;
    }
    if (!pwHasLength) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (!pwHasUpper) {
      setPwError("New password must contain at least one uppercase letter (A-Z).");
      return;
    }
    if (!pwHasLower) {
      setPwError("New password must contain at least one lowercase letter (a-z).");
      return;
    }
    if (!pwHasNumber) {
      setPwError("New password must contain at least one number (0-9).");
      return;
    }
    if (!pwHasSpecial) {
      setPwError("New password must contain at least one special character / symbol.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    setPwSuccess(false);
    try {
      await changePassword({ currentPassword: pwCurrent, newPassword: pwNew });
      setPwSuccess(true);
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (error) {
      setPwError(toApiErrorMessage(error));
    } finally {
      setPwLoading(false);
    }
  };

  const handleVehicleAdd = async () => {
    if (!newVehicle.brand.trim() || !newVehicle.model.trim() || !newVehicle.plateNumber.trim() || !newVehicle.vehicleType) {
      setVehiclesError("Please fill in all vehicle fields (brand, model, plate number, and type).");
      return;
    }
    setVehiclesError("");
    setVehicleAdding(true);
    try {
      await addVehicle({
        brand: newVehicle.brand.trim(),
        model: newVehicle.model.trim() || undefined,
        plateNumber: newVehicle.plateNumber.trim(),
        vehicleType: newVehicle.vehicleType,
        ...(newVehicleImageData ? { imageData: newVehicleImageData } : {}),
      });
      setNewVehicle({ brand: "", model: "", plateNumber: "", vehicleType: "CAR" });
      setNewVehicleImageData(null);
      setNewVehicleImageName("");
      setShowAddVehicleForm(false);
      await loadVehicles();
      setVehicleAddedSuccess(true);
      setTimeout(() => setVehicleAddedSuccess(false), 3000);
    } catch (error) {
      setVehiclesError(toApiErrorMessage(error));
    } finally {
      setVehicleAdding(false);
    }
  };

  const handleNewVehicleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewVehicleImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setNewVehicleImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVehiclePhotoUpdate = async (vehicleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await uploadVehicleImage(vehicleId, reader.result as string);
        await loadVehicles();
      } catch (error) {
        setVehiclesError(toApiErrorMessage(error));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVehicleDelete = async (id: string) => {
    setVehiclesError("");
    try {
      await deleteVehicle(id);
      await loadVehicles();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) {
        setVehiclesError("You don't have permission to delete this vehicle.");
      } else if (status === 404) {
        setVehiclesError("Vehicle not found.");
      } else {
        setVehiclesError(toApiErrorMessage(error));
      }
    }
  };

  const fullName = `${profile.firstName || "Customer"} ${profile.secondName || ""}`.trim();
  const initials =
    (profile.firstName?.charAt(0) ?? "") + (profile.secondName?.charAt(0) ?? "") || "?";

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8 animate-fade-in">

      {/* ── Profile Hero ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-24 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative px-6 py-8 md:px-10 md:py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* avatar */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white/20 bg-slate-700 flex items-center justify-center shadow-2xl">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white/70">{initials}</span>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-110 border-2 border-slate-900">
              <Camera size={15} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* info */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{fullName}</h1>
            <p className="text-slate-400 text-sm mt-1">{profile.email || "—"}</p>
            <p className="text-slate-400 text-sm">{profile.phoneNumber || "—"}</p>
          </div>

          {/* badge */}
          <div className="sm:ml-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full border border-orange-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Customer Account
            </span>
          </div>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div className="space-y-6">

          {/* Personal Information */}
          <SectionCard title="Personal Information" subtitle="Update your name, email and phone" icon={User}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" icon={User}>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                    className={inputCls}
                    placeholder="First name"
                  />
                </FormField>
                <FormField label="Last Name" icon={User}>
                  <input
                    type="text"
                    value={profile.secondName}
                    onChange={(e) => setProfile((p) => ({ ...p, secondName: e.target.value }))}
                    className={inputCls}
                    placeholder="Last name"
                  />
                </FormField>
              </div>

              <FormField label="Email Address" icon={Mail}>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className={inputCls + " cursor-not-allowed opacity-60 select-none"}
                  placeholder="you@example.com"
                  title="Email cannot be changed"
                />
                <p className="text-xs text-slate-400 mt-1">Email address cannot be changed.</p>
              </FormField>

              <FormField label="Phone Number" icon={Phone}>
                <input
                  type="text"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
                  className={inputCls}
                  placeholder="0774653123"
                />
              </FormField>

              {profileError && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                  {profileError}
                </p>
              )}

              <button
                onClick={() => handleProfileSave()}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                  profileSaved
                    ? "bg-emerald-500 text-white shadow-emerald-200"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 hover:-translate-y-0.5"
                }`}
              >
                {profileSaved ? <Check size={16} /> : <Save size={16} />}
                {profileSaved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </SectionCard>

          {/* Platform Settings */}
          <SectionCard
            title="Platform Settings"
            subtitle="Security preferences"
            icon={Shield}
            accent="text-emerald-600"
            accentBg="bg-emerald-50"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-orange-500" />
                <p className="text-sm font-semibold text-slate-700">Change Password</p>
              </div>

              <div className="relative">
                <input
                  type={showPwCurrent ? "text" : "password"}
                  placeholder="Current password"
                  value={pwCurrent}
                  onChange={(e) => {
                    setPwCurrent(e.target.value);
                    if (pwError) setPwError("");
                  }}
                  className={inputCls + " pr-10"}
                />
                <button type="button" onClick={() => setShowPwCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPwNew ? "text" : "password"}
                  placeholder="New password (min. 8 characters)"
                  value={pwNew}
                  onChange={(e) => {
                    setPwNew(e.target.value);
                    if (pwError) setPwError("");
                  }}
                  className={inputCls + " pr-10"}
                />
                <button type="button" onClick={() => setShowPwNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {pwNew.length > 0 && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Password Requirements</p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <span className={`flex items-center gap-1.5 ${pwHasLength ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pwHasLength ? "bg-emerald-500" : "bg-slate-300"}`} />
                      8+ characters
                    </span>
                    <span className={`flex items-center gap-1.5 ${pwHasUpper ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pwHasUpper ? "bg-emerald-500" : "bg-slate-300"}`} />
                      Uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1.5 ${pwHasLower ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pwHasLower ? "bg-emerald-500" : "bg-slate-300"}`} />
                      Lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1.5 ${pwHasNumber ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pwHasNumber ? "bg-emerald-500" : "bg-slate-300"}`} />
                      Number (0-9)
                    </span>
                    <span className={`flex items-center gap-1.5 col-span-2 ${pwHasSpecial ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pwHasSpecial ? "bg-emerald-500" : "bg-slate-300"}`} />
                      Symbol / special char (!@#$...)
                    </span>
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  type={showPwConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={pwConfirm}
                  onChange={(e) => {
                    setPwConfirm(e.target.value);
                    if (pwError) setPwError("");
                  }}
                  className={inputCls + " pr-10"}
                />
                <button type="button" onClick={() => setShowPwConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {pwError && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check size={14} /> Password changed successfully!
                </p>
              )}

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={pwLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-md bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 hover:-translate-y-0.5 disabled:opacity-60"
              >
                <Lock size={15} />
                {pwLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </SectionCard>

        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────── */}
        <div className="space-y-6">

          {/* My Vehicles */}
          <SectionCard
            title="My Vehicles"
            subtitle="Track all your registered vehicles"
            icon={Car}
            accent="text-indigo-600"
            accentBg="bg-indigo-50"
            action={
              <button
                type="button"
                onClick={() => {
                  setShowAddVehicleForm((p) => !p);
                  if (vehiclesError) setVehiclesError("");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-all border border-orange-200 shadow-sm cursor-pointer"
              >
                <Plus size={15} />
                Add Vehicle
              </button>
            }
          >
            {/* add vehicle form (appears when Add Vehicle button is clicked) */}
            {showAddVehicleForm && (
              <div className="p-4 mb-5 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Vehicle Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Vehicle brand (e.g. Toyota)"
                    value={newVehicle.brand}
                    onChange={(e) => {
                      setNewVehicle((p) => ({ ...p, brand: e.target.value }));
                      if (vehiclesError) setVehiclesError("");
                    }}
                    className={inputCls + " bg-white"}
                  />
                  <input
                    type="text"
                    placeholder="Model (e.g. Corolla)"
                    value={newVehicle.model}
                    onChange={(e) => {
                      setNewVehicle((p) => ({ ...p, model: e.target.value }));
                      if (vehiclesError) setVehiclesError("");
                    }}
                    className={inputCls + " bg-white"}
                  />
                  <input
                    type="text"
                    placeholder="Plate number (e.g. CAB-1234)"
                    value={newVehicle.plateNumber}
                    onChange={(e) => {
                      setNewVehicle((p) => ({ ...p, plateNumber: e.target.value }));
                      if (vehiclesError) setVehiclesError("");
                    }}
                    className={inputCls + " bg-white"}
                  />
                  <select
                    value={newVehicle.vehicleType}
                    onChange={(e) => setNewVehicle((p) => ({ ...p, vehicleType: e.target.value as "CAR" | "BIKE" | "VAN" | "TRUCK" }))}
                    className={inputCls + " bg-white"}
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Bike</option>
                    <option value="VAN">Van</option>
                    <option value="TRUCK">Truck</option>
                  </select>
                </div>

                <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm ${
                  newVehicleImageData
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-orange-300 hover:text-orange-600"
                }`}>
                  <Camera size={15} className="shrink-0" />
                  <span className="truncate">
                    {newVehicleImageData ? newVehicleImageName || "Photo selected" : "Vehicle Photo"}
                  </span>
                  {newVehicleImageData && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setNewVehicleImageData(null); setNewVehicleImageName(""); }}
                      className="ml-auto text-orange-400 hover:text-orange-600 shrink-0"
                    >
                      ×
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleNewVehicleImagePick}
                  />
                </label>

                {vehiclesError && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                    {vehiclesError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleVehicleAdd}
                  disabled={vehicleAdding}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-md bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
                >
                  <Save size={16} />
                  {vehicleAdding ? "Saving Vehicle..." : "Save Vehicle"}
                </button>
              </div>
            )}

            {vehicleAddedSuccess && (
              <p className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 flex items-center gap-2 mb-4">
                <Check size={16} /> Vehicle added successfully!
              </p>
            )}

            {/* vehicles grid */}
            {vehicles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/dashboard/customer/profile/vehicle/${vehicle.id}`}
                    className="group rounded-xl border border-slate-200 bg-white hover:border-orange-200 hover:shadow-md transition-all p-4 cursor-pointer block"
                  >
                    {/* photo — only shown if imageUrl exists */}
                    {vehicle.imageUrl && (
                      <div className="w-full h-20 rounded-lg overflow-hidden mb-3">
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.brand}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-extrabold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                          {vehicle.brand}{vehicle.model ? ` ${vehicle.model}` : ''}
                        </p>
                        <p className="text-sm font-medium text-slate-500 truncate mt-0.5">{vehicle.plateNumber}</p>
                        {vehicle.vehicleType && (
                          <span className="inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                            {vehicle.vehicleType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs font-bold text-orange-600 group-hover:text-orange-700 flex items-center gap-1 transition-colors">
                        See more details <ChevronRight size={14} />
                      </span>
                    </div>

                    {/* actions */}
                    <div className="mt-3 flex items-center justify-between">
                      <label
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-500 cursor-pointer transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Camera size={14} />
                        {vehicle.imageUrl ? "Change Photo" : "Add Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleVehiclePhotoUpdate(vehicle.id, e)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setDeleteConfirm({ open: true, vehicleId: vehicle.id }); }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              !showAddVehicleForm && (
                <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-500">No vehicles registered yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Click the &quot;+ Add Vehicle&quot; button above to add your first vehicle.</p>
                </div>
              )
            )}
          </SectionCard>

          {/* Platform Settings — END of right column content above, now full-width below */}
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, vehicleId: "" })}
        title="Remove Vehicle?"
        message="Are you sure you want to remove this vehicle? This action cannot be undone."
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={false}
        onConfirm={() => {
          handleVehicleDelete(deleteConfirm.vehicleId);
          setDeleteConfirm({ open: false, vehicleId: "" });
        }}
      />

    </div>
  );
}
