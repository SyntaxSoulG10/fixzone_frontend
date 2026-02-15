"use client";

import { useState, useRef } from "react";
import { FiCamera, FiUser, FiPhone, FiMail, FiMapPin, FiSave, FiEdit2, FiX } from "react-icons/fi";

export default function ServiceManagerProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        name: "Suresh Perera",
        role: "Service Manager",
        phone: "+94 701502004",
        email: "suresh.pre@gmail.com",
        location: "Main Service Center, NY"
    });

    const [tempData, setTempData] = useState(profileData);

    const handleEdit = () => {
        setTempData(profileData);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setProfileData(tempData);
        setIsEditing(false);
    };

    const handleSave = () => {
        setProfileData(tempData);
        setIsEditing(false);
        // API call to save the data
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
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                {!isEditing ? (
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <FiEdit2 /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <FiX /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                        >
                            <FiSave /> Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Cover Photo Area (Optional) */}
                <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-700"></div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-xl border-4 border-white bg-slate-100 overflow-hidden shadow-md flex items-center justify-center">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <FiUser className="w-10 h-10 text-slate-400" />
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    onClick={handleImageClick}
                                    className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-primary transition-colors"
                                >
                                    <FiCamera className="w-4 h-4" />
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={tempData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                ) : (
                                    <div className="text-slate-900 font-medium">{profileData.name}</div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <div className="text-slate-900 font-medium flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                        {profileData.role}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={tempData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-slate-900 flex items-center gap-2">
                                        <FiPhone className="text-slate-400" />
                                        {profileData.phone}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={tempData.email}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-slate-900 flex items-center gap-2">
                                        <FiMail className="text-slate-400" />
                                        {profileData.email}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Location</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={tempData.location}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-slate-900 flex items-center gap-2">
                                        <FiMapPin className="text-slate-400" />
                                        {profileData.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
