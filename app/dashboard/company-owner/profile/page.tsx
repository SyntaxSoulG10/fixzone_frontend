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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Chip,
    CircularProgress,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormControl as MuiFormControl,
    InputAdornment,
    Tooltip
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
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiEye,
    FiEyeOff,
    FiLock,
    FiKey,
    FiShield,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiHash
} from "react-icons/fi";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import { useSearchParams } from "next/navigation";
import { isValidEmail } from "@/utils/helpers";
import { useDashboardData } from "@/context/DashboardDataContext";

/**
 * Validation constants for profile management.
 */
const MIN_COMPANY_NAME_LENGTH = 2;
const MIN_FULL_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;
const PHONE_REGEX = /^[0-9+()\\s-]{9,20}$/;

/**
 * PROPS INTERFACES
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

/**
 * HEADER COMPONENT: Branding, cover image, and avatar.
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
                borderRadius="1rem"
                sx={{
                    overflow: "hidden",
                    background: 'linear-gradient(135deg, #FF8C42 0%, #EA580C 50%, #C2410C 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.25)'
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
                    />
                )}
                
                <Box position="absolute" top={20} right={20}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<FiCamera />}
                        onClick={handleBannerClick}
                        sx={{ 
                            bgcolor: 'rgba(255, 255, 255, 0.9)', 
                            color: '#1e293b', 
                            backdropFilter: 'blur(8px)',
                            fontWeight: 600,
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#fff' } 
                        }}
                    >
                        Change Cover
                    </Button>
                    <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={onBannerChange} />
                </Box>
            </Box>

            <Card sx={{ position: "relative", mt: -8, mx: { xs: 2, md: 4 }, py: 2.5, px: 3, borderRadius: '1rem', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size="auto">
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={profileImage || ""}
                                alt={companyName || "Company Avatar"}
                                sx={{ 
                                    width: 84, 
                                    height: 84, 
                                    bgcolor: '#fff', 
                                    border: '4px solid #fff',
                                    boxShadow: '0 8px 16px -4px rgba(0,0,0,0.12)' 
                                }}
                            >
                                {!profileImage && <FiTool color="#EA580C" size={36} />}
                            </Avatar>
                            <IconButton
                                size="small"
                                onClick={handleProfileClick}
                                aria-label="Upload profile picture"
                                sx={{ 
                                    position: 'absolute',
                                    bottom: -2,
                                    right: -2,
                                    bgcolor: '#EA580C', 
                                    color: '#fff',
                                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)', 
                                    '&:hover': { bgcolor: '#c2410c' }, 
                                    width: 30, 
                                    height: 30 
                                }}
                            >
                                <FiCamera size={15} />
                            </IconButton>
                            <input type="file" ref={profileInputRef} style={{ display: 'none' }} accept="image/*" onChange={onProfileImageChange} />
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 'grow' }}>
                        <Box height="100%">
                            <Typography variant="h5" fontWeight={700} color="#0f172a">
                                {companyName || "Service Provider"}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <Chip 
                                    label="Authorized Provider" 
                                    size="small" 
                                    sx={{ bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#EA580C', fontWeight: 600, fontSize: '0.75rem' }} 
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Company Owner Dashboard
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 'auto' }} sx={{ ml: "auto" }}>
                        <Tabs
                            value={tabValue}
                            onChange={onTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            textColor="inherit"
                            sx={{
                                '& .MuiTabs-indicator': { backgroundColor: '#EA580C', height: 3, borderRadius: '3px 3px 0 0' },
                                '& .MuiTab-root': { 
                                    color: '#64748b', 
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    minHeight: 48,
                                    fontSize: '0.925rem',
                                    '&.Mui-selected': { color: '#EA580C' } 
                                }
                            }}
                        >
                            <Tab label="Overview" icon={<FiHome size={17} />} iconPosition="start" />
                            <Tab label="Account" icon={<FiSettings size={17} />} iconPosition="start" />
                            <Tab label="Billing" icon={<FiCreditCard size={17} />} iconPosition="start" />
                        </Tabs>
                    </Grid>
                </Grid>
                {children}
            </Card>
        </Box>
    );
}

/**
 * OVERVIEW TAB: Structured Profile UI with separate sections, strict validations, and locked login email.
 */
function OverviewTab({
    formState,
    fieldErrors,
    socialData,
    isEditing,
    isSaving,
    handleEdit,
    handleSaveProfile,
    handleCancel,
    handleFieldChange,
    handleSocialChange
}: any) {
    return (
        <Box sx={{ mt: 3, px: { xs: 0, md: 1 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h6" fontWeight={700} color="#0f172a">
                        Profile & Company Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your company identity, contact channels, and credentials
                    </Typography>
                </Box>
                {!isEditing ? (
                    <Button
                        variant="outlined"
                        startIcon={<FiEdit2 />}
                        onClick={handleEdit}
                        sx={{
                            color: '#EA580C',
                            borderColor: '#EA580C',
                            borderRadius: '8px',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': { borderColor: '#c2410c', bgcolor: 'rgba(234,88,12,0.04)' }
                        }}
                    >
                        Edit Profile
                    </Button>
                ) : (
                    <Box display="flex" gap={1.5}>
                        <Button
                            variant="outlined"
                            startIcon={<FiX />}
                            onClick={handleCancel}
                            disabled={isSaving}
                            sx={{
                                color: '#64748b',
                                borderColor: '#cbd5e1',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <FiSave />}
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            sx={{
                                bgcolor: '#EA580C',
                                color: '#fff',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 2.5,
                                '&:hover': { bgcolor: '#c2410c' }
                            }}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </Box>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* 1. Company & Business Information */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card sx={{ p: 3, borderRadius: '12px', height: '100%', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#EA580C', display: 'flex' }}>
                                <FiBriefcase size={20} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                                    Company Information
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Official business presence on FixZone
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 2.5 }} />

                        <Box display="flex" flexDirection="column" gap={2.5}>
                            {/* Company Name */}
                            <Box>
                                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={0.75}>
                                    COMPANY NAME *
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={formState.companyName}
                                        onChange={(e) => handleFieldChange("companyName", e.target.value)}
                                        error={Boolean(fieldErrors.companyName)}
                                        helperText={fieldErrors.companyName || ""}
                                        placeholder="e.g. AutoCare Solutions"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiBriefcase color="#94a3b8" size={16} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #f1f5f9">
                                        <FiBriefcase color="#EA580C" size={16} />
                                        <Typography variant="body2" fontWeight={600} color="#1e293b">
                                            {formState.companyName || "—"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Owner / Registration Code (Read-Only) */}
                            <Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75}>
                                    <Typography variant="caption" fontWeight={700} color="#475569">
                                        BUSINESS REGISTRATION / OWNER CODE
                                    </Typography>
                                    <Chip label="System Generated" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f1f5f9', color: '#64748b' }} />
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f1f5f9" borderRadius="8px" border="1px solid #e2e8f0">
                                    <FiHash color="#64748b" size={16} />
                                    <Typography variant="body2" fontWeight={700} color="#334155">
                                        {formState.ownerCode || "—"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Company Contact Email */}
                            <Box>
                                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={0.75}>
                                    COMPANY CONTACT EMAIL
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="email"
                                        value={formState.companyEmail}
                                        onChange={(e) => handleFieldChange("companyEmail", e.target.value)}
                                        error={Boolean(fieldErrors.companyEmail)}
                                        helperText={fieldErrors.companyEmail || "Business email shown to customers on invoices & bookings"}
                                        placeholder="e.g. contact@yourcompany.com"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiMail color="#94a3b8" size={16} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #f1f5f9">
                                        <FiMail color="#EA580C" size={16} />
                                        <Typography variant="body2" color="#334155">
                                            {formState.companyEmail || "—"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Company Phone */}
                            <Box>
                                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={0.75}>
                                    COMPANY PHONE NUMBER
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={formState.companyNumber}
                                        onChange={(e) => handleFieldChange("companyNumber", e.target.value)}
                                        error={Boolean(fieldErrors.companyNumber)}
                                        helperText={fieldErrors.companyNumber || ""}
                                        placeholder="e.g. +94 11 234 5678"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiPhone color="#94a3b8" size={16} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #f1f5f9">
                                        <FiPhone color="#EA580C" size={16} />
                                        <Typography variant="body2" color="#334155">
                                            {formState.companyNumber || "—"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                {/* Section 2: Account Owner Personal Details */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                            <Box p={1} bgcolor="rgba(234, 88, 12, 0.1)" borderRadius="10px">
                                <FiUser color="#ea580c" size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={700} color="#1e293b">
                                    Owner Credentials
                                </Typography>
                                <Typography variant="caption" color="#64748b">
                                    Primary administrator login and contact details
                                </Typography>
                            </Box>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={2.5}>
                            {/* Owner Full Name */}
                            <Box>
                                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={0.75}>
                                    OWNER FULL NAME *
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={formState.fullName}
                                        onChange={(e) => handleFieldChange("fullName", e.target.value)}
                                        error={Boolean(fieldErrors.fullName)}
                                        helperText={fieldErrors.fullName || ""}
                                        placeholder="e.g. John Doe"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiUser color="#94a3b8" size={16} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #f1f5f9">
                                        <FiUser color="#ea580c" size={16} />
                                        <Typography variant="body2" fontWeight={600} color="#1e293b">
                                            {formState.fullName || "—"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* PRIMARY LOGIN EMAIL (IMMUTABLE - CANNOT BE CHANGED) */}
                            <Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75}>
                                    <Typography variant="caption" fontWeight={700} color="#475569">
                                        PRIMARY LOGIN EMAIL (PERMANENT)
                                    </Typography>
                                    <Tooltip title="Your primary login email is permanent and cannot be modified for security reasons">
                                        <Chip 
                                            icon={<FiLock size={11} />} 
                                            label="Cannot be changed" 
                                            size="small" 
                                            sx={{ 
                                                height: 20, 
                                                fontSize: '0.65rem', 
                                                bgcolor: '#fee2e2', 
                                                color: '#b91c1c',
                                                fontWeight: 600,
                                                '& .MuiChip-icon': { color: '#b91c1c' }
                                            }} 
                                        />
                                    </Tooltip>
                                </Box>
                                <Box 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="space-between" 
                                    p={1.25} 
                                    bgcolor="#f8fafc" 
                                    borderRadius="8px" 
                                    border="1.5px dashed #cbd5e1"
                                >
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <FiLock color="#64748b" size={16} />
                                        <Typography variant="body2" fontWeight={600} color="#334155">
                                            {formState.email || "Protected Account Email"}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.72rem' }}>
                                        Immutable
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.72rem' }}>
                                    Used to sign in to FixZone. To change password, visit the <b>Account</b> tab.
                                </Typography>
                            </Box>

                            {/* Owner Personal Phone */}
                            <Box>
                                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={0.75}>
                                    OWNER PERSONAL PHONE
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={formState.phone}
                                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                                        error={Boolean(fieldErrors.phone)}
                                        helperText={fieldErrors.phone || "Personal mobile for notifications & security alerts"}
                                        placeholder="+94 77 123 4567"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiPhone color="#94a3b8" size={16} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #f1f5f9">
                                        <FiPhone color="#ea580c" size={16} />
                                        <Typography variant="body2" color="#334155">
                                            {formState.phone || "—"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                {/* 3. Social Media & Online Links */}
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ p: 3, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex' }}>
                                <FiFacebook size={20} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                                    Social Media & Public Links
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Direct customers to your social pages and websites
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={2.5}>
                            {/* Facebook */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={0.75}>
                                    FACEBOOK URL
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={socialData.facebook}
                                        onChange={(e) => handleSocialChange("facebook", e.target.value)}
                                        placeholder="https://facebook.com/yourpage"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiFacebook color="#1877F2" size={16} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #f1f5f9">
                                        <FiFacebook color="#1877F2" size={16} />
                                        {socialData.facebook ? (
                                            <Typography 
                                                component="a" 
                                                href={socialData.facebook.startsWith('http') ? socialData.facebook : `https://${socialData.facebook}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="body2" 
                                                color="#1877F2"
                                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                            >
                                                {socialData.facebook}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Not configured</Typography>
                                        )}
                                    </Box>
                                )}
                            </Grid>

                            {/* Twitter / X */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={0.75}>
                                    TWITTER / X URL
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={socialData.twitter}
                                        onChange={(e) => handleSocialChange("twitter", e.target.value)}
                                        placeholder="https://twitter.com/yourhandle"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiTwitter color="#1DA1F2" size={16} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #f1f5f9">
                                        <FiTwitter color="#1DA1F2" size={16} />
                                        {socialData.twitter ? (
                                            <Typography 
                                                component="a" 
                                                href={socialData.twitter.startsWith('http') ? socialData.twitter : `https://${socialData.twitter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="body2" 
                                                color="#1DA1F2"
                                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                            >
                                                {socialData.twitter}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Not configured</Typography>
                                        )}
                                    </Box>
                                )}
                            </Grid>

                            {/* Instagram */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={0.75}>
                                    INSTAGRAM URL
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={socialData.instagram}
                                        onChange={(e) => handleSocialChange("instagram", e.target.value)}
                                        placeholder="https://instagram.com/yourhandle"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiInstagram color="#E4405F" size={16} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} p={1.25} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #f1f5f9">
                                        <FiInstagram color="#E4405F" size={16} />
                                        {socialData.instagram ? (
                                            <Typography 
                                                component="a" 
                                                href={socialData.instagram.startsWith('http') ? socialData.instagram : `https://${socialData.instagram}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="body2" 
                                                color="#E4405F"
                                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                            >
                                                {socialData.instagram}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Not configured</Typography>
                                        )}
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

/**
 * SECURITY TAB: Manages account security and danger zone.
 */
function SecurityTab({ onOpenPassword, onOpenDeactivate }: any) {
    return (
        <Grid container spacing={3} justifyContent="center">
            <Grid size={{ xs: 12, md: 8, xl: 7 }}>
                {/* Password & Security Card */}
                <Card sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#EA580C', display: 'flex' }}>
                            <FiShield size={22} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Security & Access</Typography>
                            <Typography variant="caption" color="text.secondary">Manage your password and protect your FixZone company account</Typography>
                        </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', mb: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#fff', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex' }}>
                                    <FiLock size={18} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">Account Password</Typography>
                                    <Typography variant="caption" color="text.secondary">Use a strong, unique password with letters, numbers, and symbols</Typography>
                                </Box>
                            </Box>
                            <Button 
                                variant="contained" 
                                startIcon={<FiKey />}
                                onClick={onOpenPassword}
                                sx={{
                                    bgcolor: '#EA580C',
                                    color: '#fff',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: '#c2410c' }
                                }}
                            >
                                Change Password
                            </Button>
                        </Box>
                    </Box>
                </Card>

                {/* Danger Zone Card */}
                <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #fecaca', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fef2f2', color: '#ef4444', display: 'flex' }}>
                            <FiAlertCircle size={22} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700} color="error.main">Danger Zone</Typography>
                            <Typography variant="caption" color="text.secondary">Irreversible actions on your company account</Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="text.primary">Deactivate Company Account</Typography>
                            <Typography variant="caption" color="text.secondary">Once deactivated, you will lose access to all your service centers and branches.</Typography>
                        </Box>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={onOpenDeactivate}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                        >
                            Deactivate Account
                        </Button>
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
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const searchParams = useSearchParams();

    const subStatus = ownerData?.subscriptionStatus || "TRIAL";
    const trialEnds = ownerData?.trialEndsAt ? new Date(ownerData.trialEndsAt) : null;
    const nextBilling = ownerData?.nextBillingDate ? new Date(ownerData.nextBillingDate) : null;
    const isAutoRenewEnabled = ownerData?.autoRenewEnabled === true;

    useEffect(() => {
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
        TRIAL: "#f59e0b",
        ACTIVE: "#10b981",
        EXPIRED: "#ef4444"
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
 * CHANGE PASSWORD DIALOG
 */
function ChangePasswordDialog({ open, onClose, onSuccess, onError }: any) {
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [touched, setTouched] = useState({ current: false, new: false, confirm: false });
    const [error, setError] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const validations = {
        length: passwords.new.length >= MIN_PASSWORD_LENGTH,
        uppercase: /[A-Z]/.test(passwords.new),
        lowercase: /[a-z]/.test(passwords.new),
        number: /[0-9]/.test(passwords.new),
        special: /[^A-Za-z0-9]/.test(passwords.new),
    };

    const strengthScore = Object.values(validations).filter(Boolean).length;
    const isPasswordStrong = strengthScore === 5;
    const isSameAsCurrent = passwords.current.length > 0 && passwords.new.length > 0 && passwords.current === passwords.new;
    const doPasswordsMatch = passwords.new === passwords.confirm && passwords.confirm.length > 0;
    const isConfirmMismatch = passwords.confirm.length > 0 && passwords.new !== passwords.confirm;

    const getStrengthDetails = () => {
        if (!passwords.new) return { label: "", color: "#e2e8f0", percent: 0 };
        if (strengthScore <= 2) return { label: "Weak", color: "#ef4444", percent: 33 };
        if (strengthScore <= 4) return { label: "Moderate", color: "#f59e0b", percent: 66 };
        return { label: "Strong", color: "#10b981", percent: 100 };
    };

    const strength = getStrengthDetails();

    const handleReset = () => {
        setPasswords({ current: "", new: "", confirm: "" });
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        setTouched({ current: false, new: false, confirm: false });
        setError("");
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleUpdate = async () => {
        setTouched({ current: true, new: true, confirm: true });
        
        if (!passwords.current) {
            return setError("Current password is required");
        }
        if (!isPasswordStrong) {
            return setError("Please ensure your new password meets all security requirements");
        }
        if (isSameAsCurrent) {
            return setError("New password cannot be the same as your current password");
        }
        if (passwords.new !== passwords.confirm) {
            return setError("New password and confirm password do not match");
        }

        setError("");
        setIsUpdating(true);
        try {
            await axios.post(`${APP_CONFIG.api.auth}/change-password`, {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            onSuccess("Password updated successfully!");
            handleReset();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.details || error.response?.data?.message || "Failed to update password. Please verify your current password.";
            setError(msg);
            onError(msg);
        } finally {
            setIsUpdating(false);
        }
    };

    const isSubmitDisabled = 
        !passwords.current || 
        !isPasswordStrong || 
        isSameAsCurrent || 
        !doPasswordsMatch || 
        isUpdating;

    return (
        <Dialog 
            open={open} 
            onClose={isUpdating ? undefined : handleClose} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle component="div" sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#EA580C', display: 'flex' }}>
                    <FiKey size={20} />
                </Box>
                <Box>
                    <Typography variant="h6" component="div" fontWeight={700}>Change Password</Typography>
                    <Typography variant="caption" component="span" color="text.secondary">Update your account credentials to keep your account safe</Typography>
                </Box>
            </DialogTitle>
            
            <Divider />

            <DialogContent sx={{ pt: 2.5 }}>
                {error && (
                    <Box mb={2.5} p={1.5} bgcolor="#fef2f2" borderRadius={2} border="1px solid #fecaca" display="flex" alignItems="center" gap={1}>
                        <FiAlertCircle color="#ef4444" size={18} />
                        <Typography variant="body2" color="error.main" fontWeight={500}>
                            {error}
                        </Typography>
                    </Box>
                )}

                <Box display="flex" flexDirection="column" gap={2.5}>
                    {/* Current Password */}
                    <Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.75}>
                            CURRENT PASSWORD *
                        </Typography>
                        <TextField
                            placeholder="Enter current password"
                            type={showCurrent ? "text" : "password"}
                            fullWidth
                            size="small"
                            disabled={isUpdating}
                            value={passwords.current}
                            onChange={(e) => {
                                setPasswords({ ...passwords, current: e.target.value });
                                if (error) setError("");
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, current: true }))}
                            error={touched.current && !passwords.current}
                            helperText={touched.current && !passwords.current ? "Current password is required" : ""}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FiKey color="#94a3b8" size={16} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            edge="end"
                                            disabled={isUpdating}
                                            aria-label="toggle current password visibility"
                                        >
                                            {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>

                    {/* New Password */}
                    <Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.75}>
                            NEW PASSWORD *
                        </Typography>
                        <TextField
                            placeholder="Enter new strong password"
                            type={showNew ? "text" : "password"}
                            fullWidth
                            size="small"
                            disabled={isUpdating}
                            value={passwords.new}
                            onChange={(e) => {
                                setPasswords({ ...passwords, new: e.target.value });
                                if (error) setError("");
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, new: true }))}
                            error={(touched.new && passwords.new.length > 0 && !isPasswordStrong) || isSameAsCurrent}
                            helperText={
                                isSameAsCurrent 
                                    ? "New password cannot be the same as current password" 
                                    : ""
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FiLock color="#94a3b8" size={16} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setShowNew(!showNew)}
                                            edge="end"
                                            disabled={isUpdating}
                                            aria-label="toggle new password visibility"
                                        >
                                            {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />

                        {/* Password Strength Indicator */}
                        {passwords.new.length > 0 && (
                            <Box mt={1.5} p={1.5} bgcolor="#f8fafc" borderRadius={2} border="1px solid #f1f5f9">
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                                        Password Strength:
                                    </Typography>
                                    <Typography variant="caption" fontWeight={700} sx={{ color: strength.color }}>
                                        {strength.label}
                                    </Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={strength.percent} 
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: '#e2e8f0',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: strength.color,
                                            borderRadius: 3,
                                            transition: 'all 0.3s ease'
                                        }
                                    }}
                                />
                            </Box>
                        )}

                        {/* Validation Requirements Checklist */}
                        <Box mt={1.5} p={1.5} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
                            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                                Password Requirements:
                            </Typography>
                            <Grid container spacing={1}>
                                {[
                                    { key: "length", label: `At least ${MIN_PASSWORD_LENGTH} characters`, valid: validations.length },
                                    { key: "uppercase", label: "One uppercase letter (A-Z)", valid: validations.uppercase },
                                    { key: "lowercase", label: "One lowercase letter (a-z)", valid: validations.lowercase },
                                    { key: "number", label: "One number (0-9)", valid: validations.number },
                                    { key: "special", label: "One special character (!@#$...)", valid: validations.special },
                                ].map((req) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={req.key}>
                                        <Box display="flex" alignItems="center" gap={0.75}>
                                            {req.valid ? (
                                                <FiCheckCircle size={14} color="#10b981" />
                                            ) : (
                                                <FiAlertCircle size={14} color="#94a3b8" />
                                            )}
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: req.valid ? '#10b981' : '#64748b',
                                                    fontWeight: req.valid ? 600 : 400,
                                                    transition: 'color 0.2s ease'
                                                }}
                                            >
                                                {req.label}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>

                    {/* Confirm New Password */}
                    <Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.75}>
                            CONFIRM NEW PASSWORD *
                        </Typography>
                        <TextField
                            placeholder="Re-enter new password"
                            type={showConfirm ? "text" : "password"}
                            fullWidth
                            size="small"
                            disabled={isUpdating}
                            value={passwords.confirm}
                            onChange={(e) => {
                                setPasswords({ ...passwords, confirm: e.target.value });
                                if (error) setError("");
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, confirm: true }))}
                            error={touched.confirm && (isConfirmMismatch || !passwords.confirm)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FiLock color="#94a3b8" size={16} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            edge="end"
                                            disabled={isUpdating}
                                            aria-label="toggle confirm password visibility"
                                        >
                                            {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />

                        {passwords.confirm.length > 0 && (
                            <Box display="flex" alignItems="center" gap={0.75} mt={0.75}>
                                {doPasswordsMatch ? (
                                    <>
                                        <FiCheckCircle size={14} color="#10b981" />
                                        <Typography variant="caption" color="#10b981" fontWeight={600}>
                                            Passwords match
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <FiAlertCircle size={14} color="#ef4444" />
                                        <Typography variant="caption" color="#ef4444" fontWeight={600}>
                                            Passwords do not match
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
                <Button 
                    onClick={handleClose} 
                    disabled={isUpdating}
                    sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleUpdate} 
                    disabled={isSubmitDisabled} 
                    variant="contained" 
                    startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <FiKey />}
                    sx={{ 
                        bgcolor: '#EA580C', 
                        color: '#fff', 
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#c2410c' },
                        '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                    }}
                >
                    {isUpdating ? "Updating Password..." : "Update Password"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * DEACTIVATE ACCOUNT DIALOG
 */
function DeactivateAccountDialog({ open, onClose, deactivateInput, setDeactivateInput, onDeactivate, isDeactivating }: any) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>Deactivate Company Account</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Are you sure you want to permanently deactivate your company account? This will hide all your service centers and cancel all active bookings.
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={1}>
                    Type <b>DELETE</b> to confirm:
                </Typography>
                <TextField 
                    fullWidth 
                    size="small"
                    placeholder="DELETE" 
                    value={deactivateInput} 
                    onChange={(e) => setDeactivateInput(e.target.value)} 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
                <Button onClick={onClose} disabled={isDeactivating} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    color="error" 
                    disabled={deactivateInput !== "DELETE" || isDeactivating} 
                    onClick={onDeactivate}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                >
                    {isDeactivating ? <CircularProgress size={20} color="inherit" /> : "Deactivate My Account"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * MAIN PAGE COMPONENT: State management, validation, and lifecycle.
 */
export default function ProfilePage() {
    const { ownerData, refreshAll } = useDashboardData();
    const searchParams = useSearchParams();
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

    // Profile Form State
    const [formState, setFormState] = useState({
        companyName: "",
        ownerCode: "",
        companyEmail: "",
        companyNumber: "",
        fullName: "",
        email: "",
        phone: "",
        location: "Sri Lanka"
    });

    const [socialData, setSocialData] = useState({
        facebook: "",
        twitter: "",
        instagram: ""
    });

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [originalFormState, setOriginalFormState] = useState(formState);
    const [originalSocialData, setOriginalSocialData] = useState(socialData);

    useEffect(() => {
        const applyOwnerData = (data: any) => {
            if (!data) return;
            setUserId(data.userId);
            setFullOwnerData(data);
            
            const loadedState = {
                companyName: data.companyName || "",
                ownerCode: data.ownerCode || "",
                companyEmail: data.companyEmail || "",
                companyNumber: data.companyNumber || "",
                fullName: data.fullName || "",
                email: data.email || "",
                phone: data.phone || "",
                location: "Sri Lanka"
            };

            setFormState(loadedState);
            setOriginalFormState(loadedState);

            const loadedSocial = {
                facebook: data.facebookUrl || "",
                twitter: data.twitterUrl || "",
                instagram: data.instagramUrl || ""
            };
            setSocialData(loadedSocial);
            setOriginalSocialData(loadedSocial);

            if (data.profilePictureUrl) setProfileImage(data.profilePictureUrl);
            if (data.bannerImageUrl) setBannerImage(data.bannerImageUrl);
        };

        if (ownerData) {
            applyOwnerData(ownerData);
        } else {
            // Direct fetch fallback if context has not loaded yet
            axios.get(`${APP_CONFIG.api.owners}/current`)
                .then((res) => {
                    if (res.data) applyOwnerData(res.data);
                })
                .catch((err) => {
                    console.warn("Direct fetch /owners/current warning:", err);
                });
        }
    }, [ownerData]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

    const handleEdit = () => {
        setIsEditing(true);
        setFieldErrors({});
        setOriginalFormState({ ...formState });
        setOriginalSocialData({ ...socialData });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFieldErrors({});
        setFormState({ ...originalFormState });
        setSocialData({ ...originalSocialData });
    };

    const handleFieldChange = (field: string, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSocialChange = (network: string, value: string) => {
        setSocialData(prev => ({ ...prev, [network]: value }));
    };

    // Real-time client-side validation
    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        // 1. Company Name (Required, min 2 chars)
        if (!formState.companyName.trim() || formState.companyName.trim().length < MIN_COMPANY_NAME_LENGTH) {
            errors.companyName = `Company name is required (at least ${MIN_COMPANY_NAME_LENGTH} characters)`;
        }

        // 2. Full Name (Required, min 2 chars)
        if (formState.fullName && formState.fullName.trim().length < MIN_FULL_NAME_LENGTH) {
            errors.fullName = `Owner name must be at least ${MIN_FULL_NAME_LENGTH} characters`;
        }

        // 3. Company Email (Optional, valid format)
        if (formState.companyEmail && formState.companyEmail.trim() && !isValidEmail(formState.companyEmail.trim())) {
            errors.companyEmail = "Please enter a valid company email address";
        }

        // 4. Company Phone (Optional, valid phone format)
        if (formState.companyNumber && formState.companyNumber.trim() && !PHONE_REGEX.test(formState.companyNumber.replace(/\s/g, ''))) {
            errors.companyNumber = "Please enter a valid phone number (9-20 digits)";
        }

        // 5. Personal Phone (Optional, valid phone format)
        if (formState.phone && formState.phone.trim() && !PHONE_REGEX.test(formState.phone.replace(/\s/g, ''))) {
            errors.phone = "Please enter a valid personal phone number (9-20 digits)";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = async () => {
        if (!validateForm()) {
            setSnackbarMessage("Please correct the highlighted validation errors.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            const targetUserId = userId || ownerData?.userId || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
            const userEmail = formState.email || fullOwnerData?.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : undefined);

            const updatedOwner = {
                ...(fullOwnerData || {}),
                userId: targetUserId,
                email: userEmail,
                fullName: formState.fullName.trim(),
                companyName: formState.companyName.trim(),
                companyNumber: formState.companyNumber.trim(),
                companyEmail: formState.companyEmail.trim(),
                phone: formState.phone.trim(),
                profilePictureUrl: profileImage,
                bannerImageUrl: bannerImage,
                facebookUrl: socialData.facebook.trim(),
                twitterUrl: socialData.twitter.trim(),
                instagramUrl: socialData.instagram.trim()
            };

            const endpoint = `${APP_CONFIG.api.owners}/current`;
            const res = await axios.put(endpoint, updatedOwner);
            if (res.data) {
                setFullOwnerData(res.data);
                if (res.data.profilePictureUrl) setProfileImage(res.data.profilePictureUrl);
                if (res.data.bannerImageUrl) setBannerImage(res.data.bannerImageUrl);
                
                const updatedState = {
                    companyName: res.data.companyName ?? formState.companyName,
                    ownerCode: res.data.ownerCode ?? formState.ownerCode,
                    companyEmail: res.data.companyEmail ?? formState.companyEmail,
                    companyNumber: res.data.companyNumber ?? formState.companyNumber,
                    fullName: res.data.fullName ?? formState.fullName,
                    email: res.data.email ?? formState.email,
                    phone: res.data.phone ?? formState.phone,
                    location: "Sri Lanka"
                };
                setFormState(updatedState);
                setOriginalFormState(updatedState);

                const updatedSocial = {
                    facebook: res.data.facebookUrl ?? socialData.facebook,
                    twitter: res.data.twitterUrl ?? socialData.twitter,
                    instagram: res.data.instagramUrl ?? socialData.instagram
                };
                setSocialData(updatedSocial);
                setOriginalSocialData(updatedSocial);
            }

            setIsEditing(false);
            await refreshAll();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('profileUpdated'));
            }
            setSnackbarMessage("Owner profile updated successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error: any) {
            console.error("Save profile error:", error);
            const msg = error.response?.data?.details || error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : "Failed to save profile changes.");
            setSnackbarMessage(msg);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setBannerImage(base64);
                
                if (isEditing) {
                    setSnackbarMessage("Cover banner preview updated. Click 'Save Changes' to apply.");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                    return;
                }

                try {
                    const targetUserId = userId || ownerData?.userId || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
                    const userEmail = formState.email || fullOwnerData?.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : undefined);
                    const updatedOwner = { 
                        ...(fullOwnerData || {}),
                        userId: targetUserId,
                        email: userEmail,
                        fullName: formState.fullName || fullOwnerData?.fullName,
                        companyName: formState.companyName || fullOwnerData?.companyName,
                        bannerImageUrl: base64 
                    };
                    const endpoint = `${APP_CONFIG.api.owners}/current`;
                    const res = await axios.put(endpoint, updatedOwner);
                    if (res.data?.bannerImageUrl) {
                        setBannerImage(res.data.bannerImageUrl);
                    }
                    if (res.data) {
                        setFullOwnerData(res.data);
                    }
                    await refreshAll();
                    setSnackbarMessage("Cover banner updated successfully!");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                } catch (err: any) {
                    console.error("Banner upload error:", err);
                    const msg = err.response?.data?.message || err.response?.data?.details || (typeof err.response?.data === 'string' ? err.response.data : "Failed to upload cover banner. Please try again.");
                    setSnackbarMessage(msg);
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setProfileImage(base64);

                if (isEditing) {
                    setSnackbarMessage("Profile picture preview updated. Click 'Save Changes' to apply.");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                    return;
                }

                try {
                    const targetUserId = userId || ownerData?.userId || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
                    const userEmail = formState.email || fullOwnerData?.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : undefined);
                    const updatedOwner = { 
                        ...(fullOwnerData || {}),
                        userId: targetUserId,
                        email: userEmail,
                        fullName: formState.fullName || fullOwnerData?.fullName,
                        companyName: formState.companyName || fullOwnerData?.companyName,
                        profilePictureUrl: base64 
                    };
                    const endpoint = `${APP_CONFIG.api.owners}/current`;
                    const res = await axios.put(endpoint, updatedOwner);
                    if (res.data?.profilePictureUrl) {
                        setProfileImage(res.data.profilePictureUrl);
                    }
                    if (res.data) {
                        setFullOwnerData(res.data);
                    }
                    await refreshAll();
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('profileUpdated'));
                    }
                    setSnackbarMessage("Profile picture updated successfully!");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                } catch (err: any) {
                    console.error("Profile picture upload error:", err);
                    const msg = err.response?.data?.message || err.response?.data?.details || (typeof err.response?.data === 'string' ? err.response.data : "Failed to upload profile picture. Please try again.");
                    setSnackbarMessage(msg);
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                }
            };
            reader.readAsDataURL(file);
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
            companyName={formState.companyName}
            isSaving={isSaving}
            onSaveProfile={handleSaveProfile}
        >
            <Box mt={4} mb={3}>
                {tabValue === 0 && (
                    <OverviewTab 
                        formState={formState}
                        fieldErrors={fieldErrors}
                        socialData={socialData}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        handleEdit={handleEdit}
                        handleSaveProfile={handleSaveProfile}
                        handleCancel={handleCancel}
                        handleFieldChange={handleFieldChange}
                        handleSocialChange={handleSocialChange}
                    />
                )}

                {tabValue === 1 && (
                    <SecurityTab 
                        onOpenPassword={() => setOpenPasswordDialog(true)} 
                        onOpenDeactivate={() => setOpenDeactivateDialog(true)} 
                    />
                )}

                {tabValue === 2 && (
                    <BillingTab 
                        ownerData={ownerData} 
                        refreshAll={refreshAll} 
                        onMessage={(msg, sev) => { 
                            setSnackbarMessage(msg); 
                            setSnackbarSeverity(sev); 
                            setSnackbarOpen(true); 
                        }} 
                    />
                )}
            </Box>

            <ChangePasswordDialog 
                open={openPasswordDialog} 
                onClose={() => setOpenPasswordDialog(false)} 
                onSuccess={(msg: string) => { 
                    setSnackbarMessage(msg); 
                    setSnackbarSeverity("success"); 
                    setSnackbarOpen(true); 
                }}
                onError={(msg: string) => { 
                    setSnackbarMessage(msg); 
                    setSnackbarSeverity("error"); 
                    setSnackbarOpen(true); 
                }}
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
                        await axios.delete(`${APP_CONFIG.api.owners}/current`);
                        setSnackbarMessage("Account deactivated successfully");
                        setSnackbarSeverity("success");
                        setSnackbarOpen(true);
                        setOpenDeactivateDialog(false);
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('role');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('fullName');
                        window.location.href = '/login';
                    } catch (error: any) {
                        const targetId = userId || ownerData?.userId || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
                        if (targetId) {
                            try {
                                await axios.delete(`${APP_CONFIG.api.owners}/${targetId}`);
                                setSnackbarMessage("Account deactivated successfully");
                                setSnackbarSeverity("success");
                                setSnackbarOpen(true);
                                setOpenDeactivateDialog(false);
                                localStorage.removeItem('token');
                                localStorage.removeItem('userId');
                                localStorage.removeItem('role');
                                localStorage.removeItem('userRole');
                                localStorage.removeItem('fullName');
                                window.location.href = '/login';
                                return;
                            } catch (retryError: any) {
                                console.error("Retry deactivation error:", retryError);
                            }
                        }
                        setSnackbarMessage(error.response?.data?.details || error.response?.data?.message || "Failed to deactivate account");
                        setSnackbarSeverity("error");
                        setSnackbarOpen(true);
                    } finally {
                        setIsDeactivating(false);
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
        </ProfileHeader>
    );
}
