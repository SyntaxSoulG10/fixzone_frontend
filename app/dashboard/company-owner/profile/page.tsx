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
    Chip,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    Radio,
    RadioGroup,
    FormControl as MuiFormControl
} from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
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
    FiDownload,
    FiExternalLink,
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw
} from "react-icons/fi";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidEmail } from "@/utils/helpers";

/**
 * Validation constants for profile management.
 */
const MIN_COMPANY_NAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
const PHONE_REGEX = /^[0-9+]{10,15}$/;

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
    isSaving: boolean;
    onSaveProfile?: () => void;
}

interface ProfileInfoCardProps {
    title: string;
    description: string;
    info: { [key: string]: string };
    social: { name: string, icon: React.ReactNode, color: string, url: string, onChange: (val: string) => void }[];
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
    companyName,
    isSaving,
    onSaveProfile
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
                    overflow: "hidden",
                    background: 'linear-gradient(195deg, #FB923C, #EA580C)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {bannerImage && (
                    <Box
                        component="img"
                        key={bannerImage} // Keys element to force re-render on update
                        src={bannerImage}
                        alt="banner"
                        sx={{
                            width: '100%',
                            height: '18.75rem',
                            objectFit: 'cover',
                        }}
                        onError={(e: any) => {
                            // Hides broken image to reveal fallback gradient
                            e.target.style.opacity = '0';
                        }}
                    />
                )}
                
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
                    <Grid size={{ xs: 12, md: 2 }} sx={{ ml: "auto", display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            disabled={isSaving}
                            startIcon={isSaving ? <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}><CircularProgress size={16} color="inherit" /></Box> : <FiSave />}
                            onClick={onSaveProfile}
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
                    {Object.keys(info).map((label) => {
                        const isEmailField = label === "Email" || label.toLowerCase().includes("email");
                        const isEmailInvalid = isEmailField && Boolean(info[label]) && !isValidEmail(info[label].trim());
                        return (
                            <Box key={label} display="flex" py={1} pr={2} alignItems="center">
                                <Typography variant="button" fontWeight="bold" textTransform="capitalize" sx={{ minWidth: 120 }}>
                                    {label}:
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        variant="standard"
                                        fullWidth
                                        type={isEmailField ? "email" : "text"}
                                        value={info[label]}
                                        onChange={(e) => onChange(label, e.target.value)}
                                        error={isEmailInvalid}
                                        helperText={isEmailInvalid ? "Please enter a valid, real email (dummy domains like example.com are not allowed)" : ""}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                ) : (
                                    <Typography variant="button" fontWeight="regular" color="text.secondary">
                                        &nbsp;{info[label]}
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}
                    <Box display="flex" py={1} pr={2} mt={1} flexDirection="column" gap={1}>
                        <Typography variant="button" fontWeight="bold" textTransform="capitalize" sx={{ minWidth: 120 }}>Social:</Typography>
                        {isEditing ? (
                            <Box display="flex" flexDirection="column" gap={1} ml={1} mt={1}>
                                {social.map((item: any, index: number) => (
                                    <Box key={index} display="flex" alignItems="center">
                                        <Box sx={{ color: item.color, display: 'flex', alignItems: 'center', mr: 2 }}>{item.icon}</Box>
                                        <TextField
                                            variant="standard"
                                            fullWidth
                                            placeholder={`${item.name} URL`}
                                            value={item.url || ''}
                                            onChange={(e) => item.onChange(e.target.value)}
                                            size="small"
                                        />
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Box display="flex" gap={1} mt={0.5}>
                                {social.map((item: any, index: number) => {
                                    const validUrl = item.url ? (item.url.startsWith('http') ? item.url : `https://${item.url}`) : '';
                                    return item.url ? (
                                        <IconButton key={index} size="small" sx={{ color: item.color }} component="a" href={validUrl} target="_blank" rel="noopener noreferrer">
                                            {item.icon}
                                        </IconButton>
                                    ) : (
                                        <IconButton key={index} size="small" sx={{ color: '#ccc' }} disabled>
                                            {item.icon}
                                        </IconButton>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}

/**
 * OVERVIEW TAB: Displays company info and details.
 */
function OverviewTab({ profileData, socialData, isEditing, handleEdit, handleSaveProfile, handleCancel, handleProfileChange, handleSocialChange }: any) {
    return (
        <Grid container spacing={1} justifyContent="center">
            <Grid size={{ xs: 12, md: 8, xl: 8 }} sx={{ display: "flex" }}>
                <Box sx={{ width: "100%" }}>
                    <ProfileInfoCard
                        title="Company Details"
                        description={`${profileData["Company Name"]} is a dedicated automotive service provider. We prioritize customer trust and technical excellence.`}
                        info={profileData}
                        social={[
                            { name: "Facebook", icon: <FiFacebook />, color: "#1877F2", url: socialData.facebook, onChange: (v: string) => handleSocialChange('facebook', v) },
                            { name: "Twitter", icon: <FiTwitter />, color: "#1DA1F2", url: socialData.twitter, onChange: (v: string) => handleSocialChange('twitter', v) },
                            { name: "Instagram", icon: <FiInstagram />, color: "#E4405F", url: socialData.instagram, onChange: (v: string) => handleSocialChange('instagram', v) },
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
 * BILLING TAB: Real Stripe Connect onboarding + Subscription checkout.
 */
function BillingTab({ ownerData, refreshAll, onMessage }: { ownerData: any; refreshAll: () => Promise<void>; onMessage: (msg: string, sev: 'success'|'error') => void }) {
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [connectLoading, setConnectLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const searchParams = useSearchParams();

    const isStripeConnected = ownerData?.stripeOnboardingComplete === true;
    const subStatus = ownerData?.subscriptionStatus || "TRIAL";
    const trialEnds = ownerData?.trialEndsAt ? new Date(ownerData.trialEndsAt) : null;
    const nextBilling = ownerData?.nextBillingDate ? new Date(ownerData.nextBillingDate) : null;
    const isAutoRenewEnabled = ownerData?.autoRenewEnabled === true;

    useEffect(() => {
        // Handle Stripe redirect results
        const subSuccess = searchParams.get("sub_success");
        const subCanceled = searchParams.get("sub_canceled");
        const sessionId = searchParams.get("session_id");

        if (subSuccess === "true" && sessionId) {
            axios.post(APP_CONFIG.api.subscriptions + "/success?session_id=" + sessionId)
                .then(async () => {
                    onMessage("Subscription activated successfully!", "success");
                    await refreshAll();
                    if (typeof window !== "undefined") {
                        const newUrl = window.location.pathname + "?tab=billing";
                        window.history.replaceState(null, "", newUrl);
                    }
                })
                .catch(() => {
                    onMessage("Failed to verify subscription. Please contact support.", "error");
                });
        }

        if (subCanceled === "true") {
            onMessage("Subscription payment was cancelled. Please select a plan and try again.", "error");
            if (typeof window !== "undefined") {
                const newUrl = window.location.pathname + "?tab=billing";
                window.history.replaceState(null, "", newUrl);
            }
        }

        // Fetch plans
        axios.get(APP_CONFIG.api.subPlans)
            .then(r => { 
                setPlans(r.data); 
                if (r.data && r.data.length > 0) {
                    setSelectedPlan(r.data[0].id || r.data[0].planId || "");
                }
            })
            .catch(() => onMessage("Could not load subscription plans", "error"))
            .finally(() => setLoadingPlans(false));
    }, []);

    const handleConnectStripe = async () => {
        setConnectLoading(true);
        try {
            const res = await axios.post(APP_CONFIG.api.payments + "/connect");
            window.location.href = res.data; // Redirect to Stripe onboarding
        } catch {
            onMessage("Failed to generate Stripe link. Please try again.", "error");
        } finally {
            setConnectLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!selectedPlan) {
            onMessage("Please select a plan first.", "error");
            return;
        }
        setCheckoutLoading(true);
        try {
            const res = await axios.post(APP_CONFIG.api.subscriptions + "/checkout", { planId: selectedPlan });
            const checkoutUrl = res.data?.checkoutUrl || res.data;
            if (!checkoutUrl || typeof checkoutUrl !== "string") {
                throw new Error("Invalid checkout URL received from server.");
            }
            window.location.href = checkoutUrl;
        } catch (err: any) {
            const msg = err?.response?.data || err?.message || "Failed to start subscription checkout. Please try again.";
            onMessage(typeof msg === "string" ? msg : JSON.stringify(msg), "error");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const statusColors: Record<string, string> = { 
        TRIAL_ACTIVE: "#f59e0b", 
        TRIAL_EXPIRED: "#ef4444", 
        PREMIUM_ACTIVE: "#10b981", 
        PREMIUM_EXPIRED: "#ef4444",
        CANCELLED: "#6b7280",
        TRIAL: "#f59e0b", // Legacy support
        ACTIVE: "#10b981", // Legacy support
        EXPIRED: "#ef4444" // Legacy support
    };
    const statusColor = statusColors[subStatus] || "#6b7280";

    const displayStatus = subStatus.replace('_', ' ');

    return (
        <Grid container spacing={3}>
            {/* Subscription Status Card */}
            <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Subscription Status</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <Chip label={displayStatus} size="small" sx={{ bgcolor: statusColor, color: '#fff', fontWeight: 700, fontSize: '0.8rem' }} />
                        {isAutoRenewEnabled && <Chip icon={<FiRefreshCw size={12} />} label="Auto-Renew ON" size="small" variant="outlined" sx={{ color: '#10b981', borderColor: '#10b981' }} />}
                    </Box>
                    {(subStatus === "TRIAL_ACTIVE" || subStatus === "TRIAL") && trialEnds && (
                        <Box mb={1}>
                            <Typography variant="body2" color="text.secondary">Trial ends on</Typography>
                            <Typography variant="subtitle1" fontWeight={700} color="#f59e0b">{trialEnds.toLocaleDateString()}</Typography>
                        </Box>
                    )}
                    {(subStatus === "PREMIUM_ACTIVE" || subStatus === "ACTIVE") && nextBilling && (
                        <Box mb={1}>
                            <Typography variant="body2" color="text.secondary">Next billing date</Typography>
                            <Typography variant="subtitle1" fontWeight={700} color="#10b981">{nextBilling.toLocaleDateString()}</Typography>
                        </Box>
                    )}
                    {(subStatus === "TRIAL_EXPIRED" || subStatus === "PREMIUM_EXPIRED" || subStatus === "EXPIRED") && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fca5a5' }}>
                            <Typography variant="body2" color="error.main" fontWeight={600}>
                                Your subscription has expired. Your service centers are currently hidden from customers. Please select a plan below to restore access.
                            </Typography>
                        </Box>
                    )}
                </Card>
            </Grid>

            {/* Subscription Checkout Card */}
            <Grid size={{ xs: 12, md: 7 }}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Subscribe</Typography>
                    <Divider sx={{ mb: 2 }} />
                    {loadingPlans ? (
                        <Box display="flex" justifyContent="center" p={3}><CircularProgress size={32} sx={{ color: '#EA580C' }} /></Box>
                    ) : (
                        <>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" display="block" mb={1}>Select a Plan</Typography>
                            <MuiFormControl component="fieldset" fullWidth>
                                <RadioGroup value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                                    {plans.map((plan: any) => {
                                        const planId = plan.id || plan.planId;
                                        return (
                                            <Box key={planId} sx={{
                                                border: `1.5px solid ${selectedPlan === planId ? '#EA580C' : '#e2e8f0'}`,
                                                borderRadius: 2, p: 2, mb: 1.5,
                                                bgcolor: selectedPlan === planId ? 'rgba(234,88,12,0.05)' : '#fff',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }} onClick={() => setSelectedPlan(planId)}>
                                                <FormControlLabel
                                                    value={planId}
                                                    control={<Radio value={planId} checked={selectedPlan === planId} onChange={() => setSelectedPlan(planId)} sx={{ color: '#EA580C', '&.Mui-checked': { color: '#EA580C' } }} />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight={700}>{plan.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary">Rs. {Number(plan.price).toLocaleString()} / {plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''}</Typography>
                                                        </Box>
                                                    }
                                                    sx={{ width: '100%', m: 0 }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </RadioGroup>
                            </MuiFormControl>

                            <Button
                                variant="contained"
                                fullWidth
                                disabled={!selectedPlan || checkoutLoading}
                                onClick={handleSubscribe}
                                startIcon={checkoutLoading ? <CircularProgress size={16} color="inherit" /> : <FiCreditCard />}
                                sx={{ bgcolor: '#EA580C', '&:hover': { bgcolor: '#c2410c' }, borderRadius: 2, py: 1.5, mt: 1, textTransform: 'none', fontWeight: 700, fontSize: '1rem' }}
                            >
                                {checkoutLoading ? "Redirecting to Stripe..." : "Proceed to Payment"}
                            </Button>
                        </>
                    )}
                </Card>
            </Grid>
        </Grid>
    );
}

/**
 * DIALOG COMPONENTS: For handling password changes and deactivation.
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

import { useDashboardData } from "@/context/DashboardDataContext";

/**
 * MAIN PAGE COMPONENT: Handles state and lifecycle.
 */
export default function ProfilePage() {
    const { ownerData, refreshAll } = useDashboardData();
    const searchParams = useSearchParams();
    // Auto-switch to correct tab when redirected with ?tab=billing or ?tab=account
    const tabParam = searchParams?.get("tab");
    const initialTab = tabParam === "billing" ? 2 : tabParam === "account" ? 1 : 0;
    const [tabValue, setTabValue] = useState(initialTab);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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
    const [socialData, setSocialData] = useState({
        facebook: "",
        twitter: "",
        instagram: ""
    });
    const [originalProfileData, setOriginalProfileData] = useState(profileData);
    const [originalSocialData, setOriginalSocialData] = useState(socialData);

    useEffect(() => {
        if (ownerData) {
            setUserId(ownerData.userId);
            setFullOwnerData(ownerData);
            const mappedData = {
                "Company Name": ownerData.companyName || "",
                "Registration": ownerData.ownerCode || "",
                "Mobile": ownerData.companyNumber || ownerData.phone || "",
                "Email": ownerData.companyEmail || ownerData.email || "",
                "Location": "Sri Lanka",
            };
            setProfileData(mappedData);
            setOriginalProfileData(mappedData);
            
            const mappedSocial = {
                facebook: ownerData.facebookUrl || "",
                twitter: ownerData.twitterUrl || "",
                instagram: ownerData.instagramUrl || ""
            };
            setSocialData(mappedSocial);
            setOriginalSocialData(mappedSocial);
            if (ownerData.profilePictureUrl) setProfileImage(ownerData.profilePictureUrl);
            if (ownerData.bannerImageUrl) setBannerImage(ownerData.bannerImageUrl);
        }
    }, [ownerData]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
    const handleEdit = () => { setIsEditing(true); setOriginalProfileData({ ...profileData }); setOriginalSocialData({ ...socialData }); };
    const handleCancel = () => { setIsEditing(false); setProfileData({ ...originalProfileData }); setSocialData({ ...originalSocialData }); };

    const handleSaveProfile = async () => {
        if (!userId || !fullOwnerData) return;
        
        // Comprehensive validation
        if (!profileData["Company Name"].trim() || profileData["Company Name"].length < MIN_COMPANY_NAME_LENGTH) {
            setSnackbarMessage(`Company name must be at least ${MIN_COMPANY_NAME_LENGTH} characters`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (profileData["Email"] && !isValidEmail(profileData["Email"].trim())) {
            setSnackbarMessage("Please enter a valid, real company email address (dummy domains like example.com are not allowed)");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (profileData["Mobile"] && !PHONE_REGEX.test(profileData["Mobile"].replace(/\s/g, ''))) {
            setSnackbarMessage("Please enter a valid mobile number (10-15 digits)");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            const updatedOwner = { 
                ...fullOwnerData, 
                companyName: profileData["Company Name"], 
                companyNumber: profileData["Mobile"], 
                companyEmail: profileData["Email"],
                profilePictureUrl: profileImage,
                bannerImageUrl: bannerImage,
                facebookUrl: socialData.facebook,
                twitterUrl: socialData.twitter,
                instagramUrl: socialData.instagram
            };
            await axios.put(`${APP_CONFIG.api.owners}/${userId}`, updatedOwner);
            setIsEditing(false);
            await refreshAll();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('profileUpdated'));
            }
            setSnackbarMessage("Profile saved successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error: any) {
            console.error("Save profile error:", error);
            const msg = error.response?.data?.details || error.response?.data?.message || "Failed to save changes.";
            setSnackbarMessage(msg);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        (window as any).handleGlobalSave = handleSaveProfile;
    }, [handleSaveProfile]);

    const handleProfileChange = (field: string, value: string) => setProfileData(prev => ({ ...prev, [field]: value }));
    const handleSocialChange = (field: string, value: string) => setSocialData(prev => ({ ...prev, [field]: value }));

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setBannerImage(base64);
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
                const base64 = reader.result as string;
                setProfileImage(base64);
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

    return (
        <ProfileHeader
            tabValue={tabValue}
            onTabChange={handleTabChange}
            bannerImage={bannerImage}
            onBannerChange={handleBannerChange}
            profileImage={profileImage}
            onProfileImageChange={handleProfileImageChange}
            companyName={profileData["Company Name"]}
            isSaving={isSaving}
            onSaveProfile={handleSaveProfile}
        >
            <Box mt={5} mb={3}>
                {tabValue === 0 && (
                    <OverviewTab 
                        profileData={profileData} 
                        socialData={socialData}
                        isEditing={isEditing} 
                        handleEdit={handleEdit} 
                        handleSaveProfile={handleSaveProfile} 
                        handleCancel={handleCancel} 
                        handleProfileChange={handleProfileChange}
                        handleSocialChange={handleSocialChange} 
                    />
                )}

                {tabValue === 1 && (
                    <SecurityTab 
                        onOpenPassword={() => setOpenPasswordDialog(true)} 
                        onOpenDeactivate={() => setOpenDeactivateDialog(true)} 
                    />
                )}

                {tabValue === 2 && <BillingTab ownerData={ownerData} refreshAll={refreshAll} onMessage={(msg, sev) => { setSnackbarMessage(msg); setSnackbarSeverity(sev); setSnackbarOpen(true); }} />}
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
                onDeactivate={async () => {
                    if (deactivateInput !== "DELETE") return;
                    try {
                        await axios.delete(`${APP_CONFIG.api.owners}/${userId}`);
                        setSnackbarMessage("Account deactivated successfully");
                        setSnackbarSeverity("success");
                        setSnackbarOpen(true);
                        setOpenDeactivateDialog(false);
                        // Log out
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    } catch (error: any) {
                        setSnackbarMessage(error.response?.data?.details || "Failed to deactivate account");
                        setSnackbarSeverity("error");
                        setSnackbarOpen(true);
                    }
                }}
            />

            <FeedbackSnackbar 
                open={snackbarOpen} 
                autoHideDuration={4000} 
                severity={snackbarSeverity as any}
                message={snackbarMessage}
                onClose={() => setSnackbarOpen(false)} 
            />
        </ProfileHeader >
    );
}
