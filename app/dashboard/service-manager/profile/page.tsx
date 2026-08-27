"use client";

import { useState, useRef, useEffect } from "react";
import {
    FiCamera,
    FiUser,
    FiPhone,
    FiMail,
    FiMapPin,
    FiSave,
    FiEdit2,
    FiX,
    FiShield,
    FiKey,
    FiCheckCircle,
    FiLoader,
    FiHome,
    FiSettings,
    FiBriefcase,
    FiHash,
    FiLock,
    FiEye,
    FiEyeOff,
    FiAlertCircle
} from "react-icons/fi";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button as MuiButton,
    CircularProgress,
    Box,
    Typography,
    IconButton,
    InputAdornment,
    LinearProgress
} from "@mui/material";

const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;
const PHONE_REGEX = /^[0-9+]{10,15}$/;

export default function ServiceManagerProfile() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "security">("overview");

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile Data State
    const [managerData, setManagerData] = useState<any>(null);
    const [profileData, setProfileData] = useState({
        fullName: "",
        role: "Service Manager",
        phone: "",
        email: "",
        location: "",
        centerName: "",
        managerCode: "",
        status: "Active"
    });

    const [tempData, setTempData] = useState(profileData);

    // Snackbar notification state
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({
        open: false,
        message: "",
        severity: "success"
    });

    const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info" = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    // Password Dialog State
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState({ current: false, new: false, confirm: false });
    const [passwordError, setPasswordError] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Password validations matching signup
    const passwordValidations = {
        length: passwords.new.length >= MIN_PASSWORD_LENGTH,
        uppercase: /[A-Z]/.test(passwords.new),
        lowercase: /[a-z]/.test(passwords.new),
        number: /[0-9]/.test(passwords.new),
        special: /[^A-Za-z0-9]/.test(passwords.new)
    };

    const isPasswordStrong = Object.values(passwordValidations).every(Boolean);
    const metPasswordConditionsCount = Object.values(passwordValidations).filter(Boolean).length;
    const isSameAsCurrentPassword = Boolean(passwords.current && passwords.new && passwords.current === passwords.new);
    const doPasswordsMatch = Boolean(passwords.new && passwords.confirm && passwords.new === passwords.confirm);

    const getPasswordStrength = () => {
        if (!passwords.new) return { percent: 0, label: "", color: "#e2e8f0" };
        if (metPasswordConditionsCount === 5) return { percent: 100, label: "Strong", color: "#10b981" };
        if (metPasswordConditionsCount >= 3) return { percent: 65, label: "Moderate", color: "#f97316" };
        return { percent: 30, label: "Weak", color: "#ef4444" };
    };

    const passwordStrength = getPasswordStrength();

    // Fetch manager details directly from DB
    const fetchManagerProfile = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${APP_CONFIG.api.managers}/current`);
            if (res.data) {
                const data = res.data;
                setManagerData(data);
                
                const mapped = {
                    fullName: data.fullName || "Service Manager",
                    role: "Service Manager",
                    phone: data.phone || "",
                    email: data.email || "",
                    location: data.location || (data.centerName ? data.centerName : "Service Center"),
                    centerName: data.centerName || "Assigned Service Center",
                    managerCode: data.managerCode || "",
                    status: data.status || "Active"
                };

                setProfileData(mapped);
                setTempData(mapped);
                if (data.profilePictureUrl) {
                    setProfileImage(data.profilePictureUrl);
                }
            }
        } catch (err: any) {
            console.error("Failed to load manager profile:", err);
            showSnackbar("Failed to load profile data from server.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchManagerProfile();
    }, []);

    const handleEdit = () => {
        setTempData({ ...profileData });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setTempData({ ...profileData });
        setIsEditing(false);
    };

    const handleSave = async () => {
        // Validation
        if (!tempData.fullName.trim() || tempData.fullName.length < MIN_NAME_LENGTH) {
            showSnackbar(`Full name must be at least ${MIN_NAME_LENGTH} characters`, "error");
            return;
        }

        if (tempData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempData.email.trim())) {
            showSnackbar("Please enter a valid email address", "error");
            return;
        }

        if (tempData.phone && !PHONE_REGEX.test(tempData.phone.replace(/[\s-]/g, ''))) {
            showSnackbar("Please enter a valid phone number (10-15 digits)", "error");
            return;
        }

        setIsSaving(true);
        try {
            const updatePayload = {
                ...managerData,
                fullName: tempData.fullName.trim(),
                email: tempData.email.trim(),
                phone: tempData.phone.trim(),
                location: tempData.location ? tempData.location.trim() : undefined,
                profilePictureUrl: profileImage
            };

            const endpoint = managerData?.userId 
                ? `${APP_CONFIG.api.managers}/${managerData.userId}` 
                : `${APP_CONFIG.api.managers}/me`;

            const res = await axios.put(endpoint, updatePayload);
            if (res.data) {
                setManagerData(res.data);
            }

            setProfileData({ ...tempData });
            setIsEditing(false);

            // Update localStorage and trigger navbar sync
            if (typeof window !== "undefined") {
                localStorage.setItem("fullName", tempData.fullName.trim());
                localStorage.setItem("userName", tempData.fullName.trim());
                if (profileImage) {
                    localStorage.setItem("profileImage", profileImage);
                }
                window.dispatchEvent(new Event("profileUpdated"));
            }

            showSnackbar("Profile updated successfully in DB!", "success");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            const msg = error.response?.data?.details || error.response?.data?.message || "Failed to update profile";
            showSnackbar(msg, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTempData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setProfileImage(base64);
                showSnackbar("Photo selected! Click 'Save Changes' to apply.", "info");
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwords.current) {
            setPasswordError("Current password is required");
            return;
        }
        if (!isPasswordStrong) {
            setPasswordError("New password must satisfy all 5 requirements listed below");
            return;
        }
        if (isSameAsCurrentPassword) {
            setPasswordError("New password cannot be the same as your current password");
            return;
        }
        if (!passwords.confirm) {
            setPasswordError("Please confirm your new password");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setPasswordError("New passwords do not match");
            return;
        }

        setPasswordError("");
        setIsUpdatingPassword(true);
        try {
            await axios.post(`${APP_CONFIG.api.auth}/change-password`, {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            showSnackbar("Password updated successfully!", "success");
            setPasswords({ current: "", new: "", confirm: "" });
            setPasswordTouched({ current: false, new: false, confirm: false });
            setOpenPasswordDialog(false);
        } catch (error: any) {
            const msg = error.response?.data?.details || error.response?.data?.message || "Failed to update password. Please verify your current password.";
            setPasswordError(msg);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleClosePasswordDialog = () => {
        if (isUpdatingPassword) return;
        setOpenPasswordDialog(false);
        setPasswords({ current: "", new: "", confirm: "" });
        setPasswordTouched({ current: false, new: false, confirm: false });
        setPasswordError("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <FiLoader className="w-10 h-10 text-orange-600 animate-spin" />
                <p className="text-slate-600 font-medium">Loading Manager Profile from Database...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Service Manager Profile</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your account information and service center details</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={handleEdit}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium shadow-sm transition-all text-sm"
                    >
                        <FiEdit2 className="text-orange-600" /> Edit Profile
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all text-sm disabled:opacity-50"
                        >
                            <FiX /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md shadow-orange-200 transition-all text-sm disabled:opacity-50"
                        >
                            {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Hero Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Decorative Cover Gradient */}
                <div className="h-36 sm:h-44 bg-gradient-to-r from-slate-900 via-orange-950 to-orange-600 relative">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 border border-white/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {profileData.status}
                    </div>
                </div>

                <div className="px-6 sm:px-8 pb-6">
                    {/* Avatar & Key Overview */}
                    <div className="relative flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 mb-6 gap-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                            <div className="relative group">
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-lg flex items-center justify-center">
                                    {profileImage ? (
                                        <img src={profileImage} alt={profileData.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white text-3xl font-bold">
                                            {profileData.fullName.charAt(0) || "M"}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleImageClick}
                                    type="button"
                                    title="Upload Profile Picture"
                                    className="absolute bottom-1 right-1 p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md border-2 border-white transition-all transform hover:scale-105"
                                >
                                    <FiCamera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{profileData.fullName}</h2>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                        <FiShield className="w-3 h-3" />
                                        {profileData.role}
                                    </span>
                                    {profileData.location && (
                                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                            <FiMapPin className="text-orange-500" />
                                            {profileData.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs (Compact sizing) */}
                        <div className="flex items-center justify-center sm:justify-end gap-1.5 border-b sm:border-b-0 border-slate-100 pb-2 sm:pb-0">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === "overview"
                                        ? "bg-orange-50 text-orange-600 border border-orange-200 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                            >
                                <FiHome className="text-xs" /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === "security"
                                        ? "bg-orange-50 text-orange-600 border border-orange-200 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                            >
                                <FiSettings className="text-xs" /> Security & Password
                            </button>
                        </div>
                    </div>

                    {/* TAB CONTENT: Overview */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                            {/* Personal Information */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-slate-50/60 rounded-xl p-6 border border-slate-200/80">
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                            <FiUser className="text-orange-600" /> Personal Information
                                        </h3>
                                        <span className="text-xs text-slate-400 font-medium">DB Synced</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Full Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Full Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={tempData.fullName}
                                                    onChange={handleChange}
                                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium text-slate-800 transition-all"
                                                    placeholder="Enter your full name"
                                                />
                                            ) : (
                                                <div className="text-sm font-semibold text-slate-900 py-2">
                                                    {profileData.fullName}
                                                </div>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Email Address
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={tempData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium text-slate-800 transition-all"
                                                    placeholder="name@fixzone.com"
                                                />
                                            ) : (
                                                <div className="text-sm font-semibold text-slate-900 py-2 flex items-center gap-1.5">
                                                    <FiMail className="text-slate-400" />
                                                    <span>{profileData.email || "manager@fixzone.com"}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Contact Number
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={tempData.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium text-slate-800 transition-all"
                                                    placeholder="+94 77 123 4567"
                                                />
                                            ) : (
                                                <div className="text-sm font-semibold text-slate-900 py-2 flex items-center gap-1.5">
                                                    <FiPhone className="text-slate-400" />
                                                    <span>{profileData.phone || "Not specified"}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Role Designation */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Role Designation
                                            </label>
                                            <div className="text-sm font-semibold text-slate-900 py-2 flex items-center gap-1.5">
                                                <FiShield className="text-orange-600" />
                                                <span>{profileData.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Center Assignment Card */}
                            <div className="space-y-6">
                                <div className="bg-slate-50/60 rounded-xl p-6 border border-slate-200/80">
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                            <FiBriefcase className="text-orange-600" /> Service Center
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                                Assigned Center
                                            </span>
                                            <p className="text-sm font-bold text-slate-800">
                                                {profileData.centerName}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                                Location
                                            </span>
                                            {isEditing ? (
                                                <div className="space-y-1.5">
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        value={tempData.location}
                                                        onChange={handleChange}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium text-slate-800 transition-all"
                                                        placeholder="Center location"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-sm font-medium text-slate-700 flex items-start gap-1.5">
                                                    <FiMapPin className="text-orange-500 mt-0.5 shrink-0" />
                                                    <span>{profileData.location || "Sri Lanka"}</span>
                                                </p>
                                            )}
                                        </div>

                                        {profileData.managerCode && (
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                                    Manager Code
                                                </span>
                                                <p className="text-sm font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                                                    {profileData.managerCode}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT: Security (Compact sizing) */}
                    {activeTab === "security" && (
                        <div className="max-w-2xl mx-auto space-y-4 pt-2">
                            <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/80">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                        <FiKey size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Account Password</h3>
                                        <p className="text-xs text-slate-500">Keep your account safe by updating your password periodically</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpenPasswordDialog(true);
                                            setPasswordError("");
                                        }}
                                        className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-xs shadow-sm transition-all"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/80">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <FiShield size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Security Credentials</h3>
                                        <p className="text-xs text-slate-500">Your role allows managing repairs, invoices, and service center schedules.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Dialog with Live Password Checker & Compact Sizing */}
            <Dialog
                open={openPasswordDialog}
                onClose={handleClosePasswordDialog}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: { borderRadius: '1.25rem', overflow: 'hidden' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box sx={{ p: 1, borderRadius: '0.625rem', bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#EA580C', display: 'flex' }}>
                            <FiKey size={18} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.2 }}>
                                Change Password
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Enter your current and new credentials
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleClosePasswordDialog} size="small" disabled={isUpdatingPassword} sx={{ color: '#94a3b8' }}>
                        <FiX size={18} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 2.5, pt: '1.25rem !important' }}>
                    {passwordError && (
                        <Box mb={2} p={1.25} bgcolor="#fef2f2" borderRadius="0.625rem" border="1px solid #fecaca" display="flex" alignItems="center" gap={1}>
                            <FiAlertCircle color="#ef4444" size={16} className="shrink-0" />
                            <Typography variant="caption" color="error.main" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                                {passwordError}
                            </Typography>
                        </Box>
                    )}

                    <Box display="flex" flexDirection="column" gap={2}>
                        {/* Current Password */}
                        <Box>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem', color: '#475569', display: 'block', mb: 0.5 }}>
                                CURRENT PASSWORD *
                            </Typography>
                            <TextField
                                placeholder="Enter current password"
                                type={showCurrentPassword ? "text" : "password"}
                                fullWidth
                                size="small"
                                disabled={isUpdatingPassword}
                                value={passwords.current}
                                onChange={(e) => {
                                    setPasswords({ ...passwords, current: e.target.value });
                                    if (passwordError) setPasswordError("");
                                }}
                                onBlur={() => setPasswordTouched(prev => ({ ...prev, current: true }))}
                                error={passwordTouched.current && !passwords.current}
                                helperText={passwordTouched.current && !passwords.current ? "Current password is required" : ""}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiKey color="#94a3b8" size={15} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                edge="end"
                                                disabled={isUpdatingPassword}
                                                aria-label="toggle current password visibility"
                                            >
                                                {showCurrentPassword ? <FiEyeOff size={15} color="#ea580c" /> : <FiEye size={15} color="#94a3b8" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: '0.625rem', fontSize: '0.85rem' }
                                }}
                            />
                        </Box>

                        {/* New Password */}
                        <Box>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem', color: '#475569', display: 'block', mb: 0.5 }}>
                                NEW PASSWORD *
                            </Typography>
                            <TextField
                                placeholder="Enter new password"
                                type={showNewPassword ? "text" : "password"}
                                fullWidth
                                size="small"
                                disabled={isUpdatingPassword}
                                value={passwords.new}
                                onChange={(e) => {
                                    setPasswords({ ...passwords, new: e.target.value });
                                    if (passwordError) setPasswordError("");
                                }}
                                onBlur={() => setPasswordTouched(prev => ({ ...prev, new: true }))}
                                error={(passwordTouched.new && passwords.new.length > 0 && !isPasswordStrong) || isSameAsCurrentPassword}
                                helperText={
                                    isSameAsCurrentPassword 
                                        ? "New password cannot be the same as current password" 
                                        : ""
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiLock color="#94a3b8" size={15} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                edge="end"
                                                disabled={isUpdatingPassword}
                                                aria-label="toggle new password visibility"
                                            >
                                                {showNewPassword ? <FiEyeOff size={15} color="#ea580c" /> : <FiEye size={15} color="#94a3b8" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: '0.625rem', fontSize: '0.85rem' }
                                }}
                            />

                            {/* Password Strength Indicator */}
                            {passwords.new.length > 0 && (
                                <Box mt={1} p={1.25} bgcolor="#f8fafc" borderRadius="0.625rem" border="1px solid #f1f5f9">
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                                            Password Strength:
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.72rem', color: passwordStrength.color }}>
                                            {passwordStrength.label}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={passwordStrength.percent}
                                        sx={{
                                            height: 5,
                                            borderRadius: 3,
                                            bgcolor: '#e2e8f0',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: passwordStrength.color,
                                                borderRadius: 3,
                                                transition: 'all 0.3s ease'
                                            }
                                        }}
                                    />
                                </Box>
                            )}

                            {/* Password Requirements Checklist (Same as Signup) */}
                            <Box mt={1} p={1.25} bgcolor="#f8fafc" borderRadius="0.625rem" border="1px solid #e2e8f0">
                                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.72rem', color: '#475569', display: 'block', mb: 0.75 }}>
                                    Password Requirements:
                                </Typography>
                                <ul className="text-xs space-y-1 pl-0.5">
                                    <li className={`flex items-center gap-1.5 text-[11px] ${passwordValidations.length ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${passwordValidations.length ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        At least 8 characters
                                    </li>
                                    <li className={`flex items-center gap-1.5 text-[11px] ${passwordValidations.uppercase ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${passwordValidations.uppercase ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        Contains an uppercase letter
                                    </li>
                                    <li className={`flex items-center gap-1.5 text-[11px] ${passwordValidations.lowercase ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${passwordValidations.lowercase ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        Contains a lowercase letter
                                    </li>
                                    <li className={`flex items-center gap-1.5 text-[11px] ${passwordValidations.number ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${passwordValidations.number ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        Contains a number
                                    </li>
                                    <li className={`flex items-center gap-1.5 text-[11px] ${passwordValidations.special ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${passwordValidations.special ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        Contains a special character
                                    </li>
                                </ul>
                            </Box>
                        </Box>

                        {/* Confirm New Password */}
                        <Box>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem', color: '#475569', display: 'block', mb: 0.5 }}>
                                CONFIRM NEW PASSWORD *
                            </Typography>
                            <TextField
                                placeholder="Re-enter new password"
                                type={showConfirmPassword ? "text" : "password"}
                                fullWidth
                                size="small"
                                disabled={isUpdatingPassword}
                                value={passwords.confirm}
                                onChange={(e) => {
                                    setPasswords({ ...passwords, confirm: e.target.value });
                                    if (passwordError) setPasswordError("");
                                }}
                                onBlur={() => setPasswordTouched(prev => ({ ...prev, confirm: true }))}
                                error={passwordTouched.confirm && (Boolean(passwords.confirm && passwords.new !== passwords.confirm) || !passwords.confirm)}
                                helperText={
                                    passwordTouched.confirm && passwords.confirm && passwords.new !== passwords.confirm
                                        ? "Passwords do not match"
                                        : ""
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiLock color="#94a3b8" size={15} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                disabled={isUpdatingPassword}
                                                aria-label="toggle confirm password visibility"
                                            >
                                                {showConfirmPassword ? <FiEyeOff size={15} color="#ea580c" /> : <FiEye size={15} color="#94a3b8" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: '0.625rem', fontSize: '0.85rem' }
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2, px: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', gap: 1 }}>
                    <button
                        type="button"
                        onClick={handleClosePasswordDialog}
                        disabled={isUpdatingPassword}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors border border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={
                            isUpdatingPassword ||
                            !passwords.current ||
                            !isPasswordStrong ||
                            isSameAsCurrentPassword ||
                            !doPasswordsMatch
                        }
                        className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                    >
                        {isUpdatingPassword ? <CircularProgress size={14} color="inherit" /> : null}
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </button>
                </DialogActions>
            </Dialog>

            {/* Toast Feedback */}
            <FeedbackSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                autoHideDuration={4000}
            />
        </div>
    );
}
