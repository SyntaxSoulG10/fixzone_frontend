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
    Switch,
    FormGroup,
    FormControlLabel,
    TextField,
    IconButton,
    Snackbar,
    Alert,
    Badge
} from "@mui/material";
import { FiHome, FiSettings, FiEdit2, FiFacebook, FiTwitter, FiInstagram, FiTool, FiActivity, FiSave, FiX, FiCamera } from "react-icons/fi";

// --- Components ---

function ProfileHeader({ tabValue, onTabChange, children, bannerImage, onBannerChange, profileImage, onProfileImageChange }: any) {
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
                    background: bannerImage ? `url(${bannerImage})` : 'linear-gradient(195deg, #FB923C, #EA580C)', // Premium Orange Gradient or Image
                    backgroundSize: "cover",
                    backgroundPosition: "50%",
                    overflow: "hidden",
                }}
            >
                {/* Banner Edit Button */}
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
                                src={profileImage || "/assets/images/bruce-mars.jpg"}
                                alt="profile-image"
                                sx={{ width: 74, height: 74, bgcolor: 'background.paper', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            >
                                <FiTool color="#EA580C" size={32} />
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
                                TechServe Solutions
                            </Typography>
                            <Typography variant="button" color="text.secondary" fontWeight="regular">
                                Authorized Service Provider
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} sx={{ ml: "auto" }}>
                        <Tabs
                            value={tabValue}
                            onChange={onTabChange}
                            textColor="inherit"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#EA580C',
                                },
                                '& .MuiTab-root': {
                                    color: 'text.secondary',
                                    '&.Mui-selected': {
                                        color: '#344767', // Dark blue/grey for selected text
                                    }
                                }
                            }}
                        >
                            <Tab label="Overview" icon={<FiHome size={18} />} iconPosition="start" />
                            <Tab label="Account" icon={<FiSettings size={18} />} iconPosition="start" />
                        </Tabs>
                    </Grid>
                </Grid>
                {children}
            </Card>
        </Box>
    );
}

function PlatformSettings() {
    return (
        <Card sx={{ boxShadow: 'none', height: '100%' }}>
            <Box p={2}>
                <Typography variant="h6" fontWeight="medium" textTransform="capitalize">
                    Platform Settings
                </Typography>
            </Box>
            <Box pt={1} pb={2} px={2} lineHeight={1.25}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase">
                    Service Alerts
                </Typography>
                <Box display="flex" flexDirection="column" mb={3}>
                    <FormControlLabel control={<Switch defaultChecked color="primary" />} label={<Typography variant="button" color="text.secondary" fontWeight="regular">Email on new booking</Typography>} />
                    <FormControlLabel control={<Switch defaultChecked color="primary" />} label={<Typography variant="button" color="text.secondary" fontWeight="regular">SMS on urgent requests</Typography>} />
                    <FormControlLabel control={<Switch color="primary" />} label={<Typography variant="button" color="text.secondary" fontWeight="regular">Weekly performance digest</Typography>} />
                </Box>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase">
                    Visibility
                </Typography>
                <Box display="flex" flexDirection="column">
                    <FormControlLabel control={<Switch defaultChecked color="primary" />} label={<Typography variant="button" color="text.secondary" fontWeight="regular">Visible to local customers</Typography>} />
                    <FormControlLabel control={<Switch color="primary" />} label={<Typography variant="button" color="text.secondary" fontWeight="regular">Auto-approve standard services</Typography>} />
                </Box>
            </Box>
        </Card>
    );
}

function ProfileInfoCard({ title, description, info, social, onEdit, isEditing, onSave, onCancel, onChange }: any) {
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

export default function ProfilePage() {
    const [tabValue, setTabValue] = useState(0);
    const [isWorkshopOpen, setIsWorkshopOpen] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    // Image State
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Profile Data State
    const [isEditing, setIsEditing] = useState(false);
    // Explicitly order keys for mapping
    const [profileData, setProfileData] = useState<{ [key: string]: string }>({
        "Company Name": "TechServe Solutions L.L.C.",
        "Registration": "REG-8829103",
        "Mobile": "+1 (555) 123-4567",
        "Email": "support@techserve.com",
        "Location": "New York, USA",
    });
    // Backup for cancel
    const [originalProfileData, setOriginalProfileData] = useState(profileData);

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

    const handleSaveProfile = () => {
        setIsEditing(false);
        setSnackbarMessage("Profile details updated successfully!");
        setSnackbarOpen(true);
    };

    const handleProfileChange = (field: string, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveStatus = () => {
        setSnackbarMessage("Workshop status and capacity saved!");
        setSnackbarOpen(true);
    };

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setBannerImage(imageUrl);
            setSnackbarMessage("Cover image updated!");
            setSnackbarOpen(true);
        }
    };

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
            setSnackbarMessage("Profile picture updated!");
            setSnackbarOpen(true);
        }
    };

    return (
        <ProfileHeader
            tabValue={tabValue}
            onTabChange={handleTabChange}
            bannerImage={bannerImage}
            onBannerChange={handleBannerChange}
            profileImage={profileImage}
            onProfileImageChange={handleProfileImageChange}
        >
            <Box mt={5} mb={3}>
                {/* Tab 0: Overview */}
                {tabValue === 0 && (
                    <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 7, xl: 8 }} sx={{ display: "flex" }}>
                            <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
                            <ProfileInfoCard
                                title="Company Details"
                                description="TechServe Solutions is a premier multi-brand vehicle service center specializing in diagnostics and express repairs. We are committed to transparency and speed."
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
                            <Divider orientation="vertical" sx={{ mx: 0 }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5, xl: 4 }}>
                            <Box pl={3} pr={2} height="100%">
                                <Typography variant="h6" fontWeight="medium" textTransform="capitalize" mb={2}>
                                    Workshop Status
                                </Typography>
                                <Box component={Card} variant="outlined" p={3} sx={{ borderColor: 'grey.300' }}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <FiActivity color={isWorkshopOpen ? "#4caf50" : "#f44336"} />
                                            <Typography variant="button" fontWeight="bold" color={isWorkshopOpen ? "success.main" : "error.main"}>
                                                {isWorkshopOpen ? "Currently Open" : "Closed"}
                                            </Typography>
                                        </Box>
                                        <Switch
                                            checked={isWorkshopOpen}
                                            onChange={(e) => setIsWorkshopOpen(e.target.checked)}
                                            color="success"
                                        />
                                    </Box>

                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Daily Capacity Limit"
                                        defaultValue="25"
                                        type="number"
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Emergency Hotline"
                                        defaultValue="+1 (555) 999-0000"
                                    />
                                    <Box pt={2}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            sx={{ bgcolor: '#EA580C', color: '#fff', '&:hover': { bgcolor: '#c2410c' } }}
                                            onClick={handleSaveStatus}
                                        >
                                            Save Status
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                )}

                {/* Tab 1: Account (Settings) */}
                {tabValue === 1 && (
                    <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <PlatformSettings />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
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
                                    <Button variant="outlined" color="primary" fullWidth sx={{ mb: 3 }}>
                                        Change Password
                                    </Button>

                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" display="block" mb={1}>
                                        Danger Zone
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                        Once you delete your account, there is no going back. Please be certain.
                                    </Typography>
                                    <Button variant="outlined" color="error" fullWidth>
                                        Deactivate Account
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>

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
        </ProfileHeader>
    );
}
