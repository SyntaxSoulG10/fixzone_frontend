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
    LinearProgress,
    Chip
} from "@mui/material";
import {
    FiHome,
    FiSettings,
    FiEdit2,
    FiFacebook,
    FiTwitter,
    FiInstagram,
    FiTool,
    FiSave,
    FiX,
    FiCamera,
    FiCreditCard,
    FiDownload
} from "react-icons/fi";
import axios from "axios";
import { APP_CONFIG } from "@/utils/config";

/**
 * PROPS INTERFACES: Defining strict representations for our components
 */
interface ProfileHeaderProps {
    tabValue: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
    children: React.ReactNode;
    bannerImage: string | null;
    onBannerChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    profileImage: string | null;
    onProfileImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    companyName: string;
}

interface ProfileInfoCardProps {
    title: string;
    description: string;
    info: { [key: string]: string };
    social: { icon: React.ReactNode, color: string }[];
    onEdit: () => void;
    isEditing: boolean;
    onSave: () => void;
    onCancel: () => void;
    onChange: (field: string, value: string) => void;
}

/**
 * HEADER COMPONENT: Separates branding from content.
 */
function ProfileHeader({ 
    tabValue, 
    onTabChange, 
    children, 
    bannerImage, 
    onBannerChange, 
    profileImage, 
    onProfileImageChange, 
    companyName 
}: ProfileHeaderProps) {
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);

    const handleBannerClick = () => bannerInputRef.current?.click();
    const handleProfileClick = () => profileInputRef.current?.click();

    return (
        <Box position="relative" mb={5}>
            <Box
                position="relative"
                minHeight="18.75rem"
                borderRadius="0.75rem"
                sx={{
                    background: bannerImage ? `url(${bannerImage})` : 'linear-gradient(195deg, #FB923C, #EA580C)',
                    backgroundSize: "cover",
                    backgroundPosition: "50%",
                    overflow: "hidden",
                }}
            >
                <Box position="absolute" top={20} right={20}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<FiCamera />}
                        onClick={handleBannerClick}
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
                                    onClick={handleProfileClick}
                                    sx={{ bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' }, width: 32, height: 32 }}
                                >
                                    <FiCamera size={16} color="#EA580C" />
                                </IconButton>
                            }
                        >
                            <Avatar
                                src={profileImage || ""}
                                alt="profile-image"
                                sx={{ width: 74, height: 74, bgcolor: 'background.paper', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            >
                                {!profileImage && <FiTool color="#EA580C" size={32} />}
                            </Avatar>
                        </Badge>
                        <input type="file" ref={profileInputRef} style={{ display: 'none' }} accept="image/*" onChange={onProfileImageChange} />
                    </Grid>
                    <Grid>
                        <Box height="100%" mt={0.5} lineHeight={1}>
                            <Typography variant="h5" fontWeight="medium">{companyName}</Typography>
                            <Typography variant="button" color="text.secondary" fontWeight="regular">
                                Authorized Service Provider
                            </Typography>
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
                            <Tab label="Billing" icon={<FiCreditCard size={18} />} iconPosition="start" />
                        </Tabs>
                    </Grid>
                </Grid>
                {children}
            </Card>
        </Box>
    );
}

/**
 * INFO CARD COMPONENT: Reusable display for company details.
 */
function ProfileInfoCard({ title, description, info, social, onEdit, isEditing, onSave, onCancel, onChange }: ProfileInfoCardProps) {
    return (
        <Card sx={{ height: "100%", boxShadow: 'none' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
                <Typography variant="h6" fontWeight="medium" textTransform="capitalize">{title}</Typography>
                {isEditing ? (
                    <Box display="flex" gap={1}>
                        <IconButton size="small" onClick={onSave} color="success"><FiSave /></IconButton>
                        <IconButton size="small" onClick={onCancel} color="error"><FiX /></IconButton>
                    </Box>
                ) : (
                    <Button variant="text" color="primary" sx={{ color: '#EA580C' }} onClick={onEdit}>
                        <FiEdit2 />
                    </Button>
                )}
            </Box>
            <Box p={2}>
                <Box mb={2} lineHeight={1}>
                    <Typography variant="button" color="text.secondary" fontWeight="light">{description}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box>
                    {Object.keys(info).map((label) => (
                        <Box key={label} display="flex" py={1} pr={2} alignItems="center">
                            <Typography variant="button" fontWeight="bold" textTransform="capitalize" sx={{ minWidth: 120 }}>
                                {label}:
                            </Typography>
                            {isEditing ? (
                                <TextField
                                    variant="standard"
                                    fullWidth
                                    value={info[label]}
                                    onChange={(e) => onChange(label, e.target.value)}
                                    size="small"
                                    sx={{ ml: 1 }}
                                />
                            ) : (
                                <Typography variant="button" fontWeight="regular" color="text.secondary">
                                    &nbsp;{info[label]}
                                </Typography>
                            )}
                        </Box>
                    ))}
                    <Box display="flex" py={1} pr={2} mt={1}>
                        <Typography variant="button" fontWeight="bold" textTransform="capitalize" sx={{ minWidth: 120 }}>Social:</Typography>
                        {social.map((item: any, index: number) => (
                            <IconButton key={index} size="small" sx={{ color: item.color }}>{item.icon}</IconButton>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}

/**
 * OVERVIEW TAB: Displays company info and details.
 */
function OverviewTab({ profileData, isEditing, handleEdit, handleSaveProfile, handleCancel, handleProfileChange }: any) {
    return (
        <Grid container spacing={1} justifyContent="center">
            <Grid size={{ xs: 12, md: 8, xl: 8 }} sx={{ display: "flex" }}>
                <Box sx={{ width: "100%" }}>
                    <ProfileInfoCard
                        title="Company Details"
                        description={`${profileData["Company Name"]} is a dedicated automotive service provider. We prioritize customer trust and technical excellence.`}
                        info={profileData}
                        social={[
                            { icon: <FiFacebook />, color: "#1877F2" },
                            { icon: <FiTwitter />, color: "#1DA1F2" },
                            { icon: <FiInstagram />, color: "#E4405F" },
                        ]}
                        isEditing={isEditing}
                        onEdit={handleEdit}
                        onSave={handleSaveProfile}
                        onCancel={handleCancel}
                        onChange={handleProfileChange}
                    />
                </Box>
            </Grid>
        </Grid>
    );
}

/**
 * SECURITY TAB: Manages account security and danger zone.
 */
function SecurityTab({ onOpenPassword, onOpenDeactivate }: any) {
    return (
        <Grid container spacing={1} justifyContent="center">
            <Grid size={{ xs: 12, md: 8, xl: 6 }}>
                <Card sx={{ boxShadow: 'none', p: 2 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>Security & Access</Typography>
                    <Box py={2}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" display="block" mb={1}>Password</Typography>
                        <Button variant="outlined" color="primary" fullWidth sx={{ mb: 3 }} onClick={onOpenPassword}>Change Password</Button>

                        <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" display="block" mb={1}>Danger Zone</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>Once you delete your account, there is no going back.</Typography>
                        <Button variant="outlined" color="error" fullWidth onClick={onOpenDeactivate}>Deactivate Account</Button>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}

/**
 * BILLING TAB: Subscription and payment history.
 */
function BillingTab() {
    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ p: 3, mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Current Plan: Professional</Typography>
                            <Typography variant="body2" color="text.secondary">You are currently on the Professional monthly plan.</Typography>
                        </Box>
                        <Chip label="Active" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                    </Box>
                    <Box mt={3} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight="bold">Rs. 15,000.00 / month</Typography>
                            <Typography variant="caption" color="text.secondary">Next payment: Feb 28, 2026</Typography>
                        </Box>
                        <Button variant="contained" size="small" sx={{ bgcolor: '#EA580C', color: 'white', textTransform: 'none', '&:hover': { bgcolor: '#c2410c' } }}>Upgrade Plan</Button>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}

/**
 * DIALOG COMPONENTS: For handling password changes and deactivation.
 */
function ChangePasswordDialog({ open, onClose }: any) {
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [error, setError] = useState("");

    const handleUpdate = () => {
        if (!passwords.current) return setError("Current password is required");
        if (passwords.new.length < 8) return setError("New password must be at least 8 characters");
        if (passwords.new !== passwords.confirm) return setError("Passwords do not match");
        
        setError("");
        // API call would go here
        onClose();
    };

    return (
        <Dialog open={open} onClose={() => { onClose(); setError(""); }} fullWidth maxWidth="sm">
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} pt={1}>
                    {error && <Typography color="error" variant="caption">{error}</Typography>}
                    <TextField label="Current Password" type="password" fullWidth value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} error={!!error && !passwords.current} />
                    <TextField label="New Password" type="password" fullWidth value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} error={!!error && passwords.new.length < 8} />
                    <TextField label="Confirm New Password" type="password" fullWidth value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} error={!!error && passwords.new !== passwords.confirm} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdate} variant="contained" sx={{ bgcolor: '#EA580C', color: '#fff', '&:hover': { bgcolor: '#c2410c' } }}>Update Password</Button>
            </DialogActions>
        </Dialog>
    );
}

function DeactivateAccountDialog({ open, onClose, deactivateInput, setDeactivateInput }: any) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ color: 'error.main' }}>Deactivate Account</DialogTitle>
            <DialogContent>
                <Typography variant="body1" paragraph>Are you sure you want to deactivate? This is permanent.</Typography>
                <TextField fullWidth placeholder="Type DELETE to confirm" value={deactivateInput} onChange={(e) => setDeactivateInput(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="error" disabled={deactivateInput !== "DELETE"}>Deactivate My Account</Button>
            </DialogActions>
        </Dialog>
    );
}

import { useDashboardData } from "@/context/DashboardDataContext";

/**
 * MAIN PAGE COMPONENT: Handles state and lifecycle.
 */
export default function ProfilePage() {
    const { ownerData, refreshAll } = useDashboardData();
    const [tabValue, setTabValue] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [fullOwnerData, setFullOwnerData] = useState<any>(null);
    
    const [profileData, setProfileData] = useState<{ [key: string]: string }>({
        "Company Name": "",
        "Registration": "",
        "Mobile": "",
        "Email": "",
        "Location": "Sri Lanka",
    });
    const [originalProfileData, setOriginalProfileData] = useState(profileData);

    useEffect(() => {
        if (ownerData) {
            setUserId(ownerData.userId);
            setFullOwnerData(ownerData);
            const mappedData = {
                "Company Name": ownerData.companyName || "N/A",
                "Registration": ownerData.ownerCode || "N/A",
                "Mobile": ownerData.companyNumber || ownerData.phone || "N/A",
                "Email": ownerData.companyEmail || ownerData.email || "N/A",
                "Location": "Sri Lanka",
            };
            setProfileData(mappedData);
            setOriginalProfileData(mappedData);
            if (ownerData.profilePictureUrl) setProfileImage(ownerData.profilePictureUrl);
            if (ownerData.bannerImageUrl) setBannerImage(ownerData.bannerImageUrl);
        }
    }, [ownerData]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
    const handleEdit = () => { setIsEditing(true); setOriginalProfileData({ ...profileData }); };
    const handleCancel = () => { setIsEditing(false); setProfileData({ ...originalProfileData }); };

    const handleSaveProfile = async () => {
        if (!userId || !fullOwnerData) return;
        
        // Comprehensive validation
        if (!profileData["Company Name"].trim() || profileData["Company Name"].length < 3) {
            setSnackbarMessage("Company name must be at least 3 characters");
            setSnackbarOpen(true);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (profileData["Email"] && !emailRegex.test(profileData["Email"])) {
            setSnackbarMessage("Please enter a valid company email");
            setSnackbarOpen(true);
            return;
        }

        const phoneRegex = /^[0-9+]{10,15}$/;
        if (profileData["Mobile"] && !phoneRegex.test(profileData["Mobile"].replace(/\s/g, ''))) {
            setSnackbarMessage("Please enter a valid mobile number (10-15 digits)");
            setSnackbarOpen(true);
            return;
        }

        try {
            const updatedOwner = { ...fullOwnerData, companyName: profileData["Company Name"], companyNumber: profileData["Mobile"], companyEmail: profileData["Email"] };
            await axios.put(`${APP_CONFIG.api.owners}/${userId}`, updatedOwner);
            setIsEditing(false);
            await refreshAll();
            setSnackbarMessage("Profile details updated successfully!");
            setSnackbarOpen(true);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to save changes.";
            setSnackbarMessage(msg);
            setSnackbarOpen(true);
        }
    };

    const handleProfileChange = (field: string, value: string) => setProfileData(prev => ({ ...prev, [field]: value }));

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setBannerImage(base64);
                if (userId && fullOwnerData) {
                    const updated = { ...fullOwnerData, bannerImageUrl: base64 };
                    await axios.put(`${APP_CONFIG.api.owners}/${userId}`, updated);
                    await refreshAll();
                    setSnackbarMessage("Cover image updated!");
                    setSnackbarOpen(true);
                }
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setProfileImage(base64);
                if (userId && fullOwnerData) {
                    const updated = { ...fullOwnerData, profilePictureUrl: base64 };
                    await axios.put(`${APP_CONFIG.api.owners}/${userId}`, updated);
                    await refreshAll();
                    setSnackbarMessage("Profile picture updated!");
                    setSnackbarOpen(true);
                }
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
    const [deactivateInput, setDeactivateInput] = useState("");

    return (
        <ProfileHeader
            tabValue={tabValue}
            onTabChange={handleTabChange}
            bannerImage={bannerImage}
            onBannerChange={handleBannerChange}
            profileImage={profileImage}
            onProfileImageChange={handleProfileImageChange}
            companyName={profileData["Company Name"]}
        >
            <Box mt={5} mb={3}>
                {tabValue === 0 && (
                    <OverviewTab 
                        profileData={profileData} 
                        isEditing={isEditing} 
                        handleEdit={handleEdit} 
                        handleSaveProfile={handleSaveProfile} 
                        handleCancel={handleCancel} 
                        handleProfileChange={handleProfileChange} 
                    />
                )}

                {tabValue === 1 && (
                    <SecurityTab 
                        onOpenPassword={() => setOpenPasswordDialog(true)} 
                        onOpenDeactivate={() => setOpenDeactivateDialog(true)} 
                    />
                )}

                {tabValue === 2 && <BillingTab />}
            </Box>

            <ChangePasswordDialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} />
            
            <DeactivateAccountDialog 
                open={openDeactivateDialog} 
                onClose={() => setOpenDeactivateDialog(false)} 
                deactivateInput={deactivateInput} 
                setDeactivateInput={setDeactivateInput} 
            />

            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar>
        </ProfileHeader >
    );
}
