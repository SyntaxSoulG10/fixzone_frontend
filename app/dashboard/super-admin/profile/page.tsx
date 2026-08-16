"use client";

import { useState, useRef, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    Button,
    Grid,
    Avatar,
    Tab,
    Tabs,
    Divider,
    TextField,
    IconButton,
    Snackbar,
    Alert,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    CircularProgress,
} from "@mui/material";
import {
    FiHome,
    FiSettings,
    FiEdit2,
    FiSave,
    FiX,
    FiCamera,
    FiShield,
    FiMail,
    FiUser,
    FiCalendar,
    FiKey,
    FiAlertTriangle,
} from "react-icons/fi";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import { useSearchParams } from "next/navigation";

/**
 * Validation constants.
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * HEADER COMPONENT: Banner + Avatar + Tabs.
 */
function ProfileHeader({
    tabValue,
    onTabChange,
    children,
    bannerImage,
    onBannerChange,
    profileImage,
    onProfileImageChange,
    adminName,
    isSaving,
    onSave,
}: {
    tabValue: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
    children: React.ReactNode;
    bannerImage: string | null;
    onBannerChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    profileImage: string | null;
    onProfileImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    adminName: string;
    isSaving: boolean;
    onSave: () => void;
}) {
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);

    return (
        <Box position="relative" mb={5}>
            <Box
                position="relative"
                minHeight="18.75rem"
                borderRadius="0.75rem"
                sx={{
                    overflow: "hidden",
                    background: 'linear-gradient(195deg, #1e293b, #EA580C)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {bannerImage && (
                    <Box
                        component="img"
                        key={bannerImage}
                        src={bannerImage}
                        alt="banner"
                        sx={{
                            width: '100%',
                            height: '18.75rem',
                            objectFit: 'cover',
                        }}
                        onError={(e: any) => {
                            e.target.style.opacity = '0';
                        }}
                    />
                )}

                <Box position="absolute" top={20} right={20}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<FiCamera />}
                        onClick={() => bannerInputRef.current?.click()}
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', color: 'text.primary', '&:hover': { bgcolor: '#fff' } }}
                    >
                        Edit Cover
                    </Button>
                    <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={onBannerChange} />
                </Box>
            </Box>

            <Card sx={{ position: "relative", mt: -8, mx: 3, py: 2, px: 2 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <IconButton
                                    size="small"
                                    onClick={() => profileInputRef.current?.click()}
                                    sx={{ bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' }, width: 32, height: 32 }}
                                >
                                    <FiCamera size={16} color="#EA580C" />
                                </IconButton>
                            }
                        >
                            <Avatar
                                src={profileImage || ""}
                                alt="profile-image"
                                sx={{ width: 74, height: 74, bgcolor: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            >
                                {!profileImage && <FiShield color="#EA580C" size={32} />}
                            </Avatar>
                        </Badge>
                        <input type="file" ref={profileInputRef} style={{ display: 'none' }} accept="image/*" onChange={onProfileImageChange} />
                    </Grid>
                    <Grid>
                        <Box height="100%" mt={0.5} lineHeight={1}>
                            <Typography variant="h5" fontWeight="medium">{adminName}</Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <Chip
                                    label="Super Admin"
                                    size="small"
                                    sx={{
                                        bgcolor: '#EA580C',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                    }}
                                />
                                <Typography variant="button" color="text.secondary" fontWeight="regular">
                                    System Administrator
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7, lg: 6 }} sx={{ ml: "auto" }}>
                        <Tabs
                            value={tabValue}
                            onChange={onTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            textColor="inherit"
                            sx={{
                                '& .MuiTabs-indicator': { backgroundColor: '#EA580C' },
                                '& .MuiTab-root': { color: 'text.secondary', '&.Mui-selected': { color: '#EA580C' } }
                            }}
                        >
                            <Tab label="Overview" icon={<FiHome size={18} />} iconPosition="start" />
                            <Tab label="Account" icon={<FiSettings size={18} />} iconPosition="start" />
                        </Tabs>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }} sx={{ ml: "auto", display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            disabled={isSaving}
                            startIcon={isSaving ? <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}><CircularProgress size={16} color="inherit" /></Box> : <FiSave />}
                            onClick={onSave}
                            sx={{
                                bgcolor: '#EA580C',
                                color: 'white',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#c2410c' }
                            }}
                        >
                            Save Profile
                        </Button>
                    </Grid>
                </Grid>
                {children}
            </Card>
        </Box>
    );
}

/**
 * OVERVIEW TAB: Displays admin info card.
 */
function OverviewTab({
    profileData,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    onChange,
}: {
    profileData: { [key: string]: string };
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (field: string, value: string) => void;
}) {
    const fieldIcons: { [key: string]: React.ReactNode } = {
        'Full Name': <FiUser size={16} />,
        'Email': <FiMail size={16} />,
        'Role': <FiShield size={16} />,
        'Member Since': <FiCalendar size={16} />,
    };

    return (
        <Grid container spacing={1} justifyContent="center">
            <Grid size={{ xs: 12, md: 8, xl: 8 }} sx={{ display: "flex" }}>
                <Card sx={{ width: "100%", boxShadow: 'none' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
                        <Typography variant="h6" fontWeight="medium" textTransform="capitalize">
                            Admin Details
                        </Typography>
                        {isEditing ? (
                            <Box display="flex" gap={1}>
                                <IconButton size="small" onClick={onSave} color="success"><FiSave /></IconButton>
                                <IconButton size="small" onClick={onCancel} color="error"><FiX /></IconButton>
                            </Box>
                        ) : (
                            <Button variant="text" sx={{ color: '#EA580C' }} onClick={onEdit}>
                                <FiEdit2 />
                            </Button>
                        )}
                    </Box>
                    <Box p={2}>
                        <Box mb={2} lineHeight={1}>
                            <Typography variant="button" color="text.secondary" fontWeight="light">
                                Manage your administrator profile information below.
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box>
                            {Object.keys(profileData).map((label) => (
                                <Box key={label} display="flex" py={1.5} pr={2} alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 150 }}>
                                        <Box sx={{ color: '#EA580C', display: 'flex' }}>
                                            {fieldIcons[label] || <FiUser size={16} />}
                                        </Box>
                                        <Typography variant="button" fontWeight="bold" textTransform="capitalize">
                                            {label}:
                                        </Typography>
                                    </Box>
                                    {isEditing && label !== 'Role' && label !== 'Member Since' ? (
                                        <TextField
                                            variant="standard"
                                            fullWidth
                                            value={profileData[label]}
                                            onChange={(e) => onChange(label, e.target.value)}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    ) : (
                                        <Typography variant="button" fontWeight="regular" color="text.secondary">
                                            &nbsp;{profileData[label]}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}

/**
 * SECURITY TAB: Password change + Danger zone.
 */
function SecurityTab({ onOpenPassword, onOpenDeactivate }: { onOpenPassword: () => void; onOpenDeactivate: () => void }) {
    return (
        <Grid container spacing={1} justifyContent="center">
            <Grid size={{ xs: 12, md: 8, xl: 6 }}>
                <Card sx={{ boxShadow: 'none', p: 2 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>Security & Access</Typography>
                    <Box py={2}>
                        {/* Password Section */}
                        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <FiKey size={18} color="#EA580C" />
                                <Typography variant="subtitle1" fontWeight={700}>Password</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Change your password to keep your account secure. Use a strong password with at least {MIN_PASSWORD_LENGTH} characters.
                            </Typography>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={onOpenPassword}
                                sx={{
                                    borderColor: '#EA580C',
                                    color: '#EA580C',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    py: 1.2,
                                    '&:hover': { bgcolor: 'rgba(234,88,12,0.05)', borderColor: '#c2410c' }
                                }}
                            >
                                Change Password
                            </Button>
                        </Box>

                        {/* Danger Zone */}
                        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid #fca5a5', bgcolor: '#fef2f2' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <FiAlertTriangle size={18} color="#ef4444" />
                                <Typography variant="subtitle1" fontWeight={700} color="error.main">Danger Zone</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Once you deactivate your account, there is no going back. Please be certain.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                onClick={onOpenDeactivate}
                                sx={{
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    py: 1.2,
                                }}
                            >
                                Deactivate Account
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}

/**
 * DIALOG: Change Password.
 */
function ChangePasswordDialog({ open, onClose, onSuccess, onError }: any) {
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [error, setError] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        if (!passwords.current) return setError("Current password is required");
        if (passwords.new.length < MIN_PASSWORD_LENGTH) return setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
        if (passwords.new !== passwords.confirm) return setError("Passwords do not match");

        setError("");
        setIsUpdating(true);
        try {
            await axios.post(`${APP_CONFIG.api.auth}/change-password`, {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            onSuccess("Password updated successfully!");
            setPasswords({ current: "", new: "", confirm: "" });
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.details || error.response?.data?.message || "Failed to update password";
            setError(msg);
            onError(msg);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => { onClose(); setError(""); }} fullWidth maxWidth="sm">
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} pt={1}>
                    {error && <Typography color="error" variant="caption">{error}</Typography>}
                    <TextField label="Current Password" type="password" fullWidth value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} error={!!error && !passwords.current} />
                    <TextField label="New Password" type="password" fullWidth value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} error={!!error && passwords.new.length < MIN_PASSWORD_LENGTH} />
                    <TextField label="Confirm New Password" type="password" fullWidth value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} error={!!error && passwords.new !== passwords.confirm} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isUpdating}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={isUpdating} variant="contained" sx={{ bgcolor: '#EA580C', color: '#fff', '&:hover': { bgcolor: '#c2410c' } }}>
                    {isUpdating ? <CircularProgress size={20} color="inherit" /> : "Update Password"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * DIALOG: Deactivate Account.
 */
function DeactivateAccountDialog({ open, onClose, deactivateInput, setDeactivateInput, onDeactivate, isDeactivating }: any) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ color: 'error.main' }}>Deactivate Account</DialogTitle>
            <DialogContent>
                <Typography variant="body1" paragraph>Are you sure you want to deactivate? This is permanent.</Typography>
                <TextField fullWidth placeholder="Type DELETE to confirm" value={deactivateInput} onChange={(e) => setDeactivateInput(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isDeactivating}>Cancel</Button>
                <Button variant="contained" color="error" disabled={deactivateInput !== "DELETE" || isDeactivating} onClick={onDeactivate}>
                    {isDeactivating ? <CircularProgress size={20} color="inherit" /> : "Deactivate My Account"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * MAIN PAGE COMPONENT.
 */
export default function SuperAdminProfilePage() {
    const searchParams = useSearchParams();
    const initialTab = searchParams?.get("tab") === "account" ? 1 : 0;
    const [tabValue, setTabValue] = useState(initialTab);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState<{ [key: string]: string }>({
        "Full Name": "",
        "Email": "",
        "Role": "Super Admin",
        "Member Since": "",
    });
    const [originalProfileData, setOriginalProfileData] = useState(profileData);

    // Load admin info from localStorage/JWT
    useEffect(() => {
        const userName = localStorage.getItem("userName") || localStorage.getItem("username") || "Super Admin";
        const userEmail = localStorage.getItem("userEmail") || localStorage.getItem("email") || "";
        const joinDate = localStorage.getItem("joinDate") || new Date().toLocaleDateString();

        const data = {
            "Full Name": userName,
            "Email": userEmail,
            "Role": "Super Admin",
            "Member Since": joinDate,
        };
        setProfileData(data);
        setOriginalProfileData(data);

        // Attempt to load saved profile/banner images
        const savedProfile = localStorage.getItem("adminProfileImage");
        const savedBanner = localStorage.getItem("adminBannerImage");
        if (savedProfile) setProfileImage(savedProfile);
        if (savedBanner) setBannerImage(savedBanner);
    }, []);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
    const handleEdit = () => { setIsEditing(true); setOriginalProfileData({ ...profileData }); };
    const handleCancel = () => { setIsEditing(false); setProfileData({ ...originalProfileData }); };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Save profile data to localStorage
            localStorage.setItem("userName", profileData["Full Name"]);
            localStorage.setItem("userEmail", profileData["Email"]);
            if (profileImage) localStorage.setItem("adminProfileImage", profileImage);
            if (bannerImage) localStorage.setItem("adminBannerImage", bannerImage);

            // Notify Navbar of profile update
            window.dispatchEvent(new Event('profileUpdated'));

            setIsEditing(false);
            setSnackbarMessage("Profile saved successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error: any) {
            setSnackbarMessage("Failed to save changes.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleProfileChange = (field: string, value: string) => setProfileData(prev => ({ ...prev, [field]: value }));

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerImage(reader.result as string);
                setSnackbarMessage("Banner preview updated. Click 'Save Profile' to apply.");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
                setSnackbarMessage("Profile preview updated. Click 'Save Profile' to apply.");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
    const [deactivateInput, setDeactivateInput] = useState("");
    const [isDeactivating, setIsDeactivating] = useState(false);

    return (
        <ProfileHeader
            tabValue={tabValue}
            onTabChange={handleTabChange}
            bannerImage={bannerImage}
            onBannerChange={handleBannerChange}
            profileImage={profileImage}
            onProfileImageChange={handleProfileImageChange}
            adminName={profileData["Full Name"]}
            isSaving={isSaving}
            onSave={handleSaveProfile}
        >
            <Box mt={5} mb={3}>
                {tabValue === 0 && (
                    <OverviewTab
                        profileData={profileData}
                        isEditing={isEditing}
                        onEdit={handleEdit}
                        onSave={handleSaveProfile}
                        onCancel={handleCancel}
                        onChange={handleProfileChange}
                    />
                )}

                {tabValue === 1 && (
                    <SecurityTab
                        onOpenPassword={() => setOpenPasswordDialog(true)}
                        onOpenDeactivate={() => setOpenDeactivateDialog(true)}
                    />
                )}
            </Box>

            <ChangePasswordDialog
                open={openPasswordDialog}
                onClose={() => setOpenPasswordDialog(false)}
                onSuccess={(msg: string) => { setSnackbarMessage(msg); setSnackbarSeverity("success"); setSnackbarOpen(true); }}
                onError={(msg: string) => { setSnackbarMessage(msg); setSnackbarSeverity("error"); setSnackbarOpen(true); }}
            />

            <DeactivateAccountDialog
                open={openDeactivateDialog}
                onClose={() => setOpenDeactivateDialog(false)}
                deactivateInput={deactivateInput}
                setDeactivateInput={setDeactivateInput}
                isDeactivating={isDeactivating}
                onDeactivate={async () => {
                    if (deactivateInput !== "DELETE") return;
                    setIsDeactivating(true);
                    try {
                        // Super admin deactivation
                        setSnackbarMessage("Account deactivated successfully");
                        setSnackbarSeverity("success");
                        setSnackbarOpen(true);
                        setOpenDeactivateDialog(false);
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    } catch (error: any) {
                        setSnackbarMessage(error.response?.data?.details || "Failed to deactivate account");
                        setSnackbarSeverity("error");
                        setSnackbarOpen(true);
                    } finally {
                        setIsDeactivating(false);
                    }
                }}
            />

            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar>
        </ProfileHeader>
    );
}
