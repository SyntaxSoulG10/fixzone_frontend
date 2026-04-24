"use client";

import { useState, useRef } from "react";
import {
    Box,
    Typography,
    Card,
    Button,
    Grid,
    Avatar,
    Tab,
    Tabs,
    Icon,
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
    FiCheck,
    FiDownload
} from "react-icons/fi";
import axios from "axios";
import { APP_CONFIG } from "@/utils/config";
import { useEffect } from "react";


// Define strict prop representations to allow predictable component usage
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

// Extracted Header Component helps cleanly separate profile manipulation logic from content sections
function ProfileHeader({ tabValue, onTabChange, children, bannerImage, onBannerChange, profileImage, onProfileImageChange, companyName }: ProfileHeaderProps) {
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);

    const handleBannerClick = () => {
        bannerInputRef.current?.click();
    };

    const handleProfileClick = () => {
        profileInputRef.current?.click();
    };

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
                    <input
                        type="file"
                        ref={bannerInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={onBannerChange}
                    />
                </Box>
            </Box>
            <Card
                sx={{
                    position: "relative",
                    mt: -8,
                    mx: 3,
                    py: 2,
                    px: 2,
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <IconButton
                                    size="small"
                                    onClick={handleProfileClick}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        boxShadow: 2,
                                        '&:hover': { bgcolor: 'grey.100' },
                                        width: 32,
                                        height: 32
                                    }}
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
                        <input
                            type="file"
                            ref={profileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={onProfileImageChange}
                        />
                    </Grid>
                    <Grid>
                        <Box height="100%" mt={0.5} lineHeight={1}>
                            <Typography variant="h5" fontWeight="medium">
                                {companyName}
                            </Typography>
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
                            allowScrollButtonsMobile
                            textColor="inherit"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#EA580C',
                                },
                                '& .MuiTab-root': {
                                    color: 'text.secondary',
                                    '&.Mui-selected': {
                                        color: '#EA580C',
                                    }
                                }
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

// Define the shape of our InfoCard to prevent props errors and unstructured passing
interface ProfileInfoCardProps {
    title: string;
    description: string;
    info: { [key: string]: string };
    social: { icon: React.ReactNode, color: "primary" | "info" | "warning" | "success" | "error" | "default" }[];
    onEdit: () => void;
    isEditing: boolean;
    onSave: () => void;
    onCancel: () => void;
    onChange: (field: string, value: string) => void;
}

// Extracted card abstraction to maintain standard padding and separation from container logic.
function ProfileInfoCard({ title, description, info, social, onEdit, isEditing, onSave, onCancel, onChange }: ProfileInfoCardProps) {
    return (
        <Card sx={{ height: "100%", boxShadow: 'none' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
                <Typography variant="h6" fontWeight="medium" textTransform="capitalize">
                    {title}
                </Typography>
                {isEditing ? (
                    <Box display="flex" gap={1}>
                        <IconButton size="small" onClick={onSave} color="success">
                            <FiSave />
                        </IconButton>
                        <IconButton size="small" onClick={onCancel} color="error">
                            <FiX />
                        </IconButton>
                    </Box>
                ) : (
                    <Button variant="text" color="primary" sx={{ color: '#EA580C' }} onClick={onEdit}>
                        <FiEdit2 />
                    </Button>
                )}
            </Box>
            <Box p={2}>
                <Box mb={2} lineHeight={1}>
                    <Typography variant="button" color="text.secondary" fontWeight="light">
                        {description}
                    </Typography>
                </Box>
                <Box sx={{ opacity: 0.3 }}>
                    <Divider />
                </Box>
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
                        <Typography variant="button" fontWeight="bold" textTransform="capitalize" sx={{ minWidth: 120 }}>
                            Social:
                        </Typography>
                        {social.map(({ icon, color }: any, index: number) => (
                            <IconButton key={index} size="small" color={color}>
                                {icon}
                            </IconButton>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}

function BillingTab() {
    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ p: 3, mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Current Plan: Professional
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You are currently on the Professional monthly plan.
                            </Typography>
                        </Box>
                        <Chip label="Active" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                    </Box>

                    <Box mt={3} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Rs. 15,000.00 / month
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Next payment: Feb 28, 2026
                            </Typography>
                        </Box>
                        <Button variant="contained" color="primary" size="small" sx={{ color: 'white', textTransform: 'none' }}>
                            Upgrade Plan
                        </Button>
                        <Button variant="text" size="small" sx={{ ml: 1, textTransform: 'none', color: 'text.secondary' }}>
                            Cancel Subscription
                        </Button>
                    </Box>

                    <Box mt={4}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Plan Usage
                        </Typography>
                        <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="caption">Service Centers</Typography>
                                <Typography variant="caption" fontWeight="bold">3 / 5</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={60} color="primary" sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                        <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="caption">Team Members</Typography>
                                <Typography variant="caption" fontWeight="bold">8 / 20</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={40} color="primary" sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                    </Box>
                </Card>

                <Card sx={{ p: 0 }}>
                    <Box p={2} borderBottom="1px solid #eee">
                        <Typography variant="h6" fontWeight="bold">
                            Billing History
                        </Typography>
                    </Box>
                    <Box>
                        {[
                            { date: "Jan 28, 2026", amount: "Rs. 15,000.00", status: "Paid", invoice: "#INV-2024-001" },
                            { date: "Dec 28, 2025", amount: "Rs. 15,000.00", status: "Paid", invoice: "#INV-2023-012" },
                            { date: "Nov 28, 2025", amount: "Rs. 15,000.00", status: "Paid", invoice: "#INV-2023-011" },
                        ].map((item, index) => (
                            <Box key={index} p={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom={index !== 2 ? "1px solid #f1f5f9" : "none"}>
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">{item.date}</Typography>
                                    <Typography variant="caption" color="text.secondary">Invoice {item.invoice}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={3}>
                                    <Box textAlign="right">
                                        <Typography variant="body2" fontWeight="medium">{item.amount}</Typography>
                                        <Typography variant="caption" color="success.main">● {item.status}</Typography>
                                    </Box>
                                    <IconButton size="small">
                                        <FiDownload size={16} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Payment Method
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} p={2} border="1px solid #e2e8f0" borderRadius={2} mt={2}>
                        <Box bgcolor="#eff6ff" p={1} borderRadius={1} color="#3b82f6">
                            <FiCreditCard size={24} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold">Visa ending in 4242</Typography>
                            <Typography variant="caption" color="text.secondary">Expiry 09/2028</Typography>
                        </Box>
                    </Box>
                    <Button variant="outlined" fullWidth size="small" sx={{ mt: 2, textTransform: 'none' }}>
                        Update Payment Method
                    </Button>
                </Card>

                <Card sx={{ p: 3, bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="#ea580c" gutterBottom>
                        Need more capacity?
                    </Typography>
                    <Typography variant="body2" color="#9a3412" paragraph>
                        Upgrade to our Enterprise plan for unlimited service centers and priority support.
                    </Typography>
                    <Button variant="contained" size="small" sx={{ bgcolor: '#ea580c', color: 'white', '&:hover': { bgcolor: '#c2410c' }, textTransform: 'none' }}>
                        View Enterprise Options
                    </Button>
                </Card>
            </Grid>
        </Grid>
    );
}



export default function ProfilePage() {
    const [tabValue, setTabValue] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [fullOwnerData, setFullOwnerData] = useState<any>(null);
    const [profileData, setProfileData] = useState<{ [key: string]: string }>({
        "Company Name": "Ranasinghe Motors",
        "Registration": "FIX/OWN/001",
        "Mobile": "+94 77 123 4567",
        "Email": "info@ranasinghemotors.lk",
        "Location": "Colombo, Sri Lanka",
    });
    const [originalProfileData, setOriginalProfileData] = useState(profileData);

    useEffect(() => {
        const fetchOwnerProfile = async () => {
            try {
                const response = await axios.get(APP_CONFIG.api.owners + "/current");
                const owner = response.data;
                if (owner) {
                    setUserId(owner.userId);
                    setFullOwnerData(owner);
                    setProfileData({
                        "Company Name": owner.companyName || "N/A",
                        "Registration": owner.ownerCode || "N/A",
                        "Mobile": owner.companyNumber || owner.phone || "N/A",
                        "Email": owner.companyEmail || owner.email || "N/A",
                        "Location": "Sri Lanka",
                    });
                    setOriginalProfileData({
                        "Company Name": owner.companyName || "N/A",
                        "Registration": owner.ownerCode || "N/A",
                        "Mobile": owner.companyNumber || owner.phone || "N/A",
                        "Email": owner.companyEmail || owner.email || "N/A",
                        "Location": "Sri Lanka",
                    });
                    if (owner.profilePictureUrl) {
                        setProfileImage(owner.profilePictureUrl);
                    }
                    if (owner.bannerImageUrl) {
                        setBannerImage(owner.bannerImageUrl);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch owner profile:", error);
            }
        };
        fetchOwnerProfile();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleEdit = () => {
        setOriginalProfileData({ ...profileData });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setProfileData({ ...originalProfileData });
        setIsEditing(false);
    };

    const handleSaveProfile = async () => {
        if (!userId || !fullOwnerData) return;

        try {
            const updatedOwner = {
                ...fullOwnerData,
                companyName: profileData["Company Name"],
                companyNumber: profileData["Mobile"],
                companyEmail: profileData["Email"],
                profilePictureUrl: profileImage,
                bannerImageUrl: bannerImage
            };

            await axios.put(`${APP_CONFIG.api.owners}/${userId}`, updatedOwner);
            setIsEditing(false);
            setSnackbarMessage("Profile details updated successfully!");
            setSnackbarOpen(true);
            setFullOwnerData(updatedOwner);
        } catch (error) {
            console.error("Failed to save profile:", error);
            setSnackbarMessage("Failed to save profile changes.");
            setSnackbarOpen(true);
        }
    };

    const handleProfileChange = (field: string, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                setBannerImage(base64String);
                
                // Persistence - Save immediately when image is selected
                if (userId && fullOwnerData) {
                    try {
                        const updatedData = { ...fullOwnerData, bannerImageUrl: base64String };
                        await axios.put(`${APP_CONFIG.api.owners}/${userId}`, updatedData);
                        setSnackbarMessage("Cover image updated and saved!");
                        setSnackbarOpen(true);
                        setFullOwnerData(updatedData);
                    } catch (error) {
                        console.error("Failed to save banner:", error);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                setProfileImage(base64String);
                
                // Persistence - Save immediately when image is selected
                if (userId && fullOwnerData) {
                    try {
                        const updatedData = { ...fullOwnerData, profilePictureUrl: base64String };
                        await axios.put(`${APP_CONFIG.api.owners}/${userId}`, updatedData);
                        setSnackbarMessage("Profile picture updated and saved!");
                        setSnackbarOpen(true);
                        setFullOwnerData(updatedData);
                    } catch (error) {
                        console.error("Failed to save profile picture:", error);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [deactivateInput, setDeactivateInput] = useState("");

    const handleOpenPasswordDialog = () => setOpenPasswordDialog(true);
    const handleClosePasswordDialog = () => {
        setOpenPasswordDialog(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleChangePasswordSubmit = () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setSnackbarMessage("New passwords do not match.");
            setSnackbarOpen(true);
            return;
            return;
        }
        setSnackbarMessage("Password changed successfully.");
        setSnackbarOpen(true);
        handleClosePasswordDialog();
    };

    const handleOpenDeactivateDialog = () => setOpenDeactivateDialog(true);
    const handleCloseDeactivateDialog = () => {
        setOpenDeactivateDialog(false);
        setDeactivateInput("");
    };

    const handleDeactivateConfirm = () => {
        if (deactivateInput !== "DELETE") {
            setSnackbarMessage("Please type DELETE to confirm.");
            setSnackbarOpen(true);
            return;
        }
        setSnackbarMessage("Account deactivation initiated.");
        setSnackbarOpen(true);
        handleCloseDeactivateDialog();
    };
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
                    <Grid container spacing={1} justifyContent="center">
                        <Grid size={{ xs: 12, md: 8, xl: 8 }} sx={{ display: "flex" }}>
                            <Box sx={{ width: "100%" }}>
                                <ProfileInfoCard
                                    title="Company Details"
                                    description={`${profileData["Company Name"]} is a dedicated automotive service provider. We prioritize customer trust and technical excellence in every repair.`}
                                    info={profileData}
                                    social={[
                                        { icon: <FiFacebook />, color: "primary" },
                                        { icon: <FiTwitter />, color: "info" },
                                        { icon: <FiInstagram />, color: "warning" },
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
                )}

                {tabValue === 1 && (
                    <Grid container spacing={1} justifyContent="center">
                        <Grid size={{ xs: 12, md: 8, xl: 6 }}>
                            <Card sx={{ boxShadow: 'none', height: '100%' }}>
                                <Box p={2}>
                                    <Typography variant="h6" fontWeight="medium">
                                        Security & Access
                                    </Typography>
                                </Box>
                                <Box px={2} pb={3}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" display="block" mb={1}>
                                        Password
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        fullWidth
                                        sx={{ mb: 3 }}
                                        onClick={handleOpenPasswordDialog}
                                    >
                                        Change Password
                                    </Button>

                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" display="block" mb={1}>
                                        Danger Zone
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                        Once you delete your account, there is no going back. Please be certain.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        onClick={handleOpenDeactivateDialog}
                                    >
                                        Deactivate Account
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                )}


                {tabValue === 2 && (
                    <BillingTab />
                )}
            </Box>

            <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} fullWidth maxWidth="sm">
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} pt={1}>
                        <TextField
                            label="Current Password"
                            type="password"
                            fullWidth
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            fullWidth
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePasswordDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleChangePasswordSubmit} variant="contained" color="primary" sx={{ color: '#fff' }}>Update Password</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeactivateDialog} onClose={handleCloseDeactivateDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ color: 'error.main' }}>Deactivate Account</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        Are you sure you want to deactivate your company account? This action cannot be undone immediately.
                        All your data will be archived for 30 days before permanent deletion.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Type <strong>DELETE</strong> below to confirm.
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="DELETE"
                        value={deactivateInput}
                        onChange={(e) => setDeactivateInput(e.target.value)}
                        error={deactivateInput.length > 0 && deactivateInput !== "DELETE"}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeactivateDialog} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleDeactivateConfirm}
                        variant="contained"
                        color="error"
                        disabled={deactivateInput !== "DELETE"}
                    >
                        Deactivate My Account
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </ProfileHeader >
    );
}
