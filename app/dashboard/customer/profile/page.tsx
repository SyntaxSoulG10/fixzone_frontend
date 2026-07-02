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
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/UI/Button";
import {
  addVehicle,
  deleteVehicle,
  getProfile,
  getSettings,
  getVehicles,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  toApiErrorMessage,
  updateProfile,
  updateSettings,
  uploadProfilePicture,
  uploadVehicleImage,
  type CustomerProfile,
  type CustomerSettings,
  type Vehicle,
  type PaymentMethod,
} from "@/lib/customer-api";

/* ── tiny helpers ─────────────────────────────────────────── */

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  accent = "text-orange-600",
  accentBg = "bg-orange-50",
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  accent?: string;
  accentBg?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className={`w-9 h-9 ${accentBg} ${accent} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon size={17} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-none">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
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
    notificationsOn: true,
    language: "English",
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [newVehicle, setNewVehicle] = useState({ brand: "", model: "", plateNumber: "", vehicleType: "CAR" as "CAR" | "BIKE" | "VAN" | "TRUCK" });
  const [newVehicleImageData, setNewVehicleImageData] = useState<string | null>(null);
  const [newVehicleImageName, setNewVehicleImageName] = useState<string>("");
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardType: "Visa",
    lastFour: "",
    brandColor: "bg-orange-500",
  });
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [vehiclesError, setVehiclesError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [vehicleAddedSuccess, setVehicleAddedSuccess] = useState(false);

  const loadVehicles = async () => {
    const data = await getVehicles();
    setVehicles(data);
  };

  const loadPaymentMethods = async () => {
    const data = await getPaymentMethods();
    setPaymentMethods(data);
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
          notificationsOn: Boolean(settingsData?.notificationsOn),
          language: settingsData?.language ?? "English",
        });
      } catch (error) {
        const message = toApiErrorMessage(error);
        setProfileError(message);
        setSettingsError(message);
      }

      try {
        await Promise.all([loadVehicles(), loadPaymentMethods()]);
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }
    if (p.phoneNumber && !/^\d{10}$/.test(p.phoneNumber.replace(/[\s-]/g, ''))) {
      setProfileError("Phone number must be exactly 10 digits.");
      return;
    }

    setProfileError("");
    setProfileSaved(false);
    try {
      const updated = await updateProfile(customProfile || profile);
      const newProfile = {
        firstName: updated?.firstName ?? "",
        secondName: updated?.secondName ?? "",
        email: updated?.email ?? "",
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
        notificationsOn: Boolean(updated?.notificationsOn),
        language: updated?.language ?? "English",
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (error) {
      setSettingsError(toApiErrorMessage(error));
    }
  };

  const handleVehicleAdd = async () => {
    if (!newVehicle.brand.trim() || !newVehicle.model.trim() || !newVehicle.plateNumber.trim() || !newVehicle.vehicleType) {
      setVehiclesError("Please fill in all vehicle fields (brand, model, plate number, and type).");
      return;
    }
    setVehiclesError("");
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
      await loadVehicles();
      setVehicleAddedSuccess(true);
      setTimeout(() => setVehicleAddedSuccess(false), 3000);
    } catch (error) {
      setVehiclesError(toApiErrorMessage(error));
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
    } catch (error) {
      setVehiclesError(toApiErrorMessage(error));
    }
  };

  const handlePaymentMethodAdd = async () => {
    if (!newPaymentMethod.lastFour.trim()) return;
    try {
      await addPaymentMethod({
        cardType: newPaymentMethod.cardType,
        lastFour: newPaymentMethod.lastFour.trim().slice(-4),
        brandColor: newPaymentMethod.brandColor,
      });
      setNewPaymentMethod({ cardType: "Visa", lastFour: "", brandColor: "bg-orange-500" });
      setShowAddPayment(false);
      await loadPaymentMethods();
    } catch (error) {
      setSettingsError(toApiErrorMessage(error));
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
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </FormField>

              <FormField label="Phone Number" icon={Phone}>
                <input
                  type="text"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
                  className={inputCls}
                  placeholder="+94 7xx xxx xxxx"
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

          {/* Payment Methods */}
          <SectionCard
            title="Payment Methods"
            subtitle="Manage your saved cards"
            icon={CreditCard}
            accent="text-blue-600"
            accentBg="bg-blue-50"
          >
            {/* add form */}
            {showAddPayment && (
              <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newPaymentMethod.cardType}
                    onChange={(e) =>
                      setNewPaymentMethod((prev) => ({
                        ...prev,
                        cardType: e.target.value,
                        brandColor: e.target.value === "Visa" ? "bg-red-500" : "bg-blue-600",
                      }))
                    }
                    className={inputCls}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Last 4 digits"
                    maxLength={4}
                    value={newPaymentMethod.lastFour}
                    onChange={(e) =>
                      setNewPaymentMethod((prev) => ({
                        ...prev,
                        lastFour: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    className={inputCls}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePaymentMethodAdd}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => setShowAddPayment(false)}
                    className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* cards list */}
            <div className="space-y-3 mb-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-7 ${pm.brandColor || "bg-slate-400"} rounded-md shadow-sm`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{pm.cardType}</p>
                        <p className="text-xs text-slate-400">•••• •••• •••• {pm.lastFour}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePaymentMethod(pm.id).then(loadPaymentMethods)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic py-2">No payment methods added yet.</p>
              )}
            </div>

            <button
              onClick={() => setShowAddPayment(!showAddPayment)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-500 hover:text-orange-600 text-sm font-semibold transition-all"
            >
              <Plus size={16} />
              Add Payment Method
            </button>
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
          >
            {/* vehicles grid */}
            {vehicles.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-5">
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
                        onClick={(e) => { e.preventDefault(); handleVehicleDelete(vehicle.id); }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* add vehicle */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Vehicle brand (e.g. Toyota)"
                  value={newVehicle.brand}
                  onChange={(e) => setNewVehicle((p) => ({ ...p, brand: e.target.value }))}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder="Model (e.g. Corolla)"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle((p) => ({ ...p, model: e.target.value }))}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder="Plate number"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle((p) => ({ ...p, plateNumber: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <select
                value={newVehicle.vehicleType}
                onChange={(e) => setNewVehicle((p) => ({ ...p, vehicleType: e.target.value as "CAR" | "BIKE" | "VAN" | "TRUCK" }))}
                className={inputCls}
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="VAN">Van</option>
                <option value="TRUCK">Truck</option>
              </select>

              
              <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm ${
                newVehicleImageData
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-orange-300 hover:text-orange-600"
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

              {vehicleAddedSuccess && (
                <p className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check size={16} /> Vehicle added successfully!
                </p>
              )}

              <button
                type="button"
                onClick={handleVehicleAdd}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 text-sm font-semibold transition-all"
              >
                <Plus size={16} />
                Add Vehicle
              </button>
            </div>
          </SectionCard>

          {/* Platform Settings */}
          <SectionCard
            title="Platform Settings"
            subtitle="Notifications and security preferences"
            icon={Shield}
            accent="text-emerald-600"
            accentBg="bg-emerald-50"
          >
            <div className="space-y-5">

              {/* notifications toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                    <Bell size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Push Notifications</p>
                    <p className="text-xs text-slate-400">Service updates and reminders</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notificationsOn}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, notificationsOn: !prev.notificationsOn }))
                  }
                  className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 ${
                    settings.notificationsOn ? "bg-orange-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      settings.notificationsOn ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {settingsError && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                  {settingsError}
                </p>
              )}

              <button
                onClick={handleSettingsSave}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                  settingsSaved
                    ? "bg-emerald-500 text-white shadow-emerald-200"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 hover:-translate-y-0.5"
                }`}
              >
                {settingsSaved ? <Check size={16} /> : <Save size={16} />}
                {settingsSaved ? "Saved!" : "Save Settings"}
              </button>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
