"use client";

import { useState, useEffect, useRef } from "react";
import {
    FiBell,
    FiSend,
    FiLoader,
    FiInfo,
    FiCheckCircle,
    FiAlertTriangle,
    FiArrowRight,
    FiBold,
    FiItalic,
    FiUnderline,
    FiList,
    FiImage,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight,
    FiPaperclip,
    FiEye,
    FiEdit2,
    FiFileText
} from "react-icons/fi";
import { broadcastCustomNotification, fetchAdminNotifications, fetchAllUsers } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function SuperAdminNotificationsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("INFO");
    const [targetRole, setTargetRole] = useState("ALL");
    const [targetUrl, setTargetUrl] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [log, setLog] = useState<any[]>([]);
    const [isLoadingLog, setIsLoadingLog] = useState(true);
    const [editorTab, setEditorTab] = useState<"WRITE" | "PREVIEW">("WRITE");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<{ id: string, name: string, size: number, type: "image" | "document", base64: string }[]>([]);
    const editorRef = useRef<HTMLDivElement>(null);

    const handleFormat = (command: string, value: string = "") => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setMessage(editorRef.current.innerHTML);
        }
    };

    const handleEditorInput = () => {
        if (editorRef.current) {
            setMessage(editorRef.current.innerHTML);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setAttachedFiles(prev => [
                    ...prev,
                    {
                        id: Math.random().toString(36).substring(7),
                        name: file.name,
                        size: file.size,
                        type: "image",
                        base64
                    }
                ]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Document exceeds 5MB limit.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setAttachedFiles(prev => [
                    ...prev,
                    {
                        id: Math.random().toString(36).substring(7),
                        name: file.name,
                        size: file.size,
                        type: "document",
                        base64
                    }
                ]);
            };
            reader.readAsDataURL(file);
        }
    };

    const getCompiledMessage = () => {
        let compiled = message;
        attachedFiles.forEach(file => {
            if (file.type === "image") {
                compiled += `<br><img src="${file.base64}" alt="${file.name}" style="max-height: 200px; border-radius: 8px; margin: 8px 0; display: block; object-fit: cover;" />`;
            } else {
                compiled += `<br><a href="${file.base64}" download="${file.name}" class="notif-attachment-link" contenteditable="false" style="display: inline-flex; align-items: center; gap: 10px; padding: 10px 14px; margin: 8px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #1e293b; max-width: 100%; box-sizing: border-box;">
                    <span style="font-size: 24px; color: #f97316; line-height: 1;">📄</span>
                    <div style="display: flex; flex-direction: column; min-w-0; text-align: left;">
                        <span style="font-size: 13px; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 240px; color: #0f172a; line-height: 1.25;">${file.name}</span>
                        <span style="font-size: 9px; color: #64748b; line-height: 1.25; margin-top: 2px;">Click to download attachment (${(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                </a><br>`;
            }
        });
        return compiled;
    };

    const loadLog = async () => {
        try {
            const data = await fetchAdminNotifications();
            if (!data) {
                setLog([]);
                return;
            }

            // 1. Sort by creation date descending (newest first)
            const sorted = [...data].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            // 2. De-duplicate: Group identical broadcast items sent around the same time
            const uniqueLogs: any[] = [];
            sorted.forEach((item) => {
                const isDuplicate = uniqueLogs.some((uniqueItem) => {
                    const timeDiff = Math.abs(
                        new Date(uniqueItem.createdAt).getTime() - new Date(item.createdAt).getTime()
                    );
                    return (
                        uniqueItem.title === item.title &&
                        uniqueItem.message === item.message &&
                        timeDiff < 10000 // 10-second window
                    );
                });
                if (!isDuplicate) {
                    uniqueLogs.push(item);
                }
            });

            setLog(uniqueLogs);
        } catch (error) {
            console.error("Failed to load sent notifications log:", error);
        } finally {
            setIsLoadingLog(false);
        }
    };

    useEffect(() => {
        loadLog();
        const loadUsers = async () => {
            try {
                const data = await fetchAllUsers();
                setUsers(data || []);
            } catch (error) {
                console.error("Failed to load users:", error);
            }
        };
        loadUsers();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasText = message.trim() && message !== "<br>" && message !== "<p><br></p>";
        const hasTextOrAttachments = hasText || attachedFiles.length > 0;
        if (!title.trim() || !hasTextOrAttachments) {
            toast.error("Please enter a title and message.");
            return;
        }

        let targetUserId: string | undefined = undefined;
        if (targetRole === "PERSONAL") {
            if (!recipientEmail.trim()) {
                toast.error("Please enter the recipient's email address.");
                return;
            }
            const matched = users.find(u => u.email.toLowerCase() === recipientEmail.trim().toLowerCase());
            if (!matched) {
                toast.error("Validation failed: Enter a valid, registered email address.");
                return;
            }
            targetUserId = matched.userId;
        }

        setIsSending(true);
        try {
            await broadcastCustomNotification({
                title,
                message: getCompiledMessage(),
                type,
                targetRole,
                targetUrl: targetUrl.trim() || undefined,
                targetUserId
            });
            toast.success("Notification sent successfully!");
            // Reset form
            setTitle("");
            setMessage("");
            setTargetUrl("");
            setSelectedUser(null);
            setRecipientEmail("");
            setAttachedFiles([]);
            if (editorRef.current) {
                editorRef.current.innerHTML = "";
            }
            // Refresh sent logs
            loadLog();
        } catch (error: any) {
            toast.error(error.message || "Failed to send notification.");
        } finally {
            setIsSending(false);
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "ALL": return "All Users";
            case "ROLE_COMPANY_OWNER":
            case "OWNER": return "Company Owners";
            case "ROLE_SERVICE_MANAGER":
            case "MANAGER": return "Service Managers";
            case "ROLE_CUSTOMER":
            case "CUSTOMER": return "Customers";
            default: return role;
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <FiBell className="text-orange-500" /> Notifications Manager
                </h1>
                <p className="text-slate-500 mt-1">
                    Compose and broadcast custom system notifications or announcements to platform users.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Compose Form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">
                            Compose Announcement
                        </h2>
                        {/* Editor Mode Tabs */}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
                            <button
                                type="button"
                                onClick={() => setEditorTab("WRITE")}
                                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                                    editorTab === "WRITE" ? "bg-white text-orange-600 shadow-xs" : "hover:text-slate-900"
                                }`}
                            >
                                <FiEdit2 className="w-3.5 h-3.5" /> Write
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditorTab("PREVIEW")}
                                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                                    editorTab === "PREVIEW" ? "bg-white text-orange-600 shadow-xs" : "hover:text-slate-900"
                                }`}
                            >
                                <FiEye className="w-3.5 h-3.5" /> Live Preview
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="space-y-4">
                        {editorTab === "WRITE" ? (
                            <>
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all text-sm"
                                        placeholder="e.g., Scheduled System Maintenance"
                                        required
                                    />
                                </div>

                                {/* Message with Rich Text Editor */}
                                <div className="flex flex-col gap-1.5">
                                    <style dangerouslySetInnerHTML={{__html: `
                                        .rich-editor:empty:before {
                                            content: attr(data-placeholder);
                                            color: #94a3b8;
                                            cursor: text;
                                            display: block;
                                        }
                                        .rich-editor font[face="sans-serif"] { font-family: sans-serif; }
                                        .rich-editor font[face="Inter, sans-serif"] { font-family: 'Inter', sans-serif; }
                                        .rich-editor font[face="Outfit, sans-serif"] { font-family: 'Outfit', sans-serif; }
                                        .rich-editor font[face="'Playfair Display', serif"] { font-family: 'Playfair Display', serif; }
                                        .rich-editor font[face="'JetBrains Mono', monospace"] { font-family: 'JetBrains Mono', monospace; }
                                        .rich-editor font[face="Roboto, sans-serif"] { font-family: 'Roboto', sans-serif; }
                                    `}} />
                                    <label className="block text-sm font-semibold text-slate-700">Message</label>
                                    
                                    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-300 transition-all">
                                        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap gap-3 items-center text-slate-600 select-none">
                                            {/* Font Family Dropdown */}
                                            <div className="flex items-center">
                                                <select
                                                    onChange={(e) => handleFormat("fontName", e.target.value)}
                                                    defaultValue="sans-serif"
                                                    className="px-2 py-1 border border-slate-250 rounded text-xs bg-white text-slate-700 focus:outline-none cursor-pointer hover:border-slate-350 transition-colors"
                                                    title="Font Family"
                                                >
                                                    <option value="sans-serif">Default (Sans-serif)</option>
                                                    <option value="Inter, sans-serif">Inter</option>
                                                    <option value="Outfit, sans-serif">Outfit</option>
                                                    <option value="'Playfair Display', serif">Playfair Display</option>
                                                    <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                                                    <option value="Roboto, sans-serif">Roboto</option>
                                                </select>
                                            </div>

                                            {/* Font Size Dropdown */}
                                            <div className="flex items-center">
                                                <select
                                                    onChange={(e) => handleFormat("fontSize", e.target.value)}
                                                    defaultValue="3"
                                                    className="px-2 py-1 border border-slate-250 rounded text-xs bg-white text-slate-700 focus:outline-none cursor-pointer hover:border-slate-350 transition-colors"
                                                    title="Font Size"
                                                >
                                                    <option value="1">Small (10px)</option>
                                                    <option value="2">Medium-Small (12px)</option>
                                                    <option value="3">Normal (14px)</option>
                                                    <option value="4">Medium-Large (16px)</option>
                                                    <option value="5">Large (18px)</option>
                                                    <option value="6">Extra Large (24px)</option>
                                                    <option value="7">Huge (32px)</option>
                                                </select>
                                            </div>

                                            <div className="w-px h-5 bg-slate-250"></div>

                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); handleFormat("bold"); }}
                                                className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors"
                                                title="Bold"
                                            >
                                                <FiBold className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); handleFormat("italic"); }}
                                                className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors"
                                                title="Italic"
                                            >
                                                <FiItalic className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); handleFormat("underline"); }}
                                                className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors"
                                                title="Underline"
                                            >
                                                <FiUnderline className="w-4 h-4" />
                                            </button>
                                            
                                            <div className="w-px h-5 bg-slate-250 mx-1"></div>
                                            
                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); handleFormat("insertUnorderedList"); }}
                                                className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors"
                                                title="Bullet List"
                                            >
                                                <FiList className="w-4 h-4" />
                                            </button>
                                            
                                            <div className="w-px h-5 bg-slate-250 mx-1"></div>
                                            
                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); handleFormat("justifyLeft"); }}
                                                className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors"
                                                title="Align Left"
                                            >
                                                <FiAlignLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); handleFormat("justifyCenter"); }}
                                                className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors"
                                                title="Align Center"
                                            >
                                                <FiAlignCenter className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); handleFormat("justifyRight"); }}
                                                className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors"
                                                title="Align Right"
                                            >
                                                <FiAlignRight className="w-4 h-4" />
                                            </button>
                                            
                                            <div className="w-px h-5 bg-slate-250 mx-1"></div>
                                            
                                            {/* Presets and Custom Color Picker */}
                                            <div className="flex gap-1 items-center flex-wrap max-w-[180px]">
                                                {([
                                                    "#1e293b", "#64748b", "#ef4444", "#f43f5e", 
                                                    "#f97316", "#f59e0b", "#10b981", "#059669", 
                                                    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"
                                                ] as const).map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onMouseDown={(e) => { e.preventDefault(); handleFormat("foreColor", color); }}
                                                        className="w-3.5 h-3.5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer shrink-0"
                                                        style={{ backgroundColor: color }}
                                                        title={`Text color: ${color}`}
                                                    />
                                                ))}
                                            </div>

                                            <div className="relative flex items-center justify-center shrink-0">
                                                <label className="p-1.5 hover:bg-slate-250 hover:text-slate-900 rounded transition-colors cursor-pointer flex items-center justify-center" title="Custom text color">
                                                    <span className="w-4 h-4 rounded-full border border-slate-350 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 block"></span>
                                                    <input
                                                        type="color"
                                                        onChange={(e) => handleFormat("foreColor", e.target.value)}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                            
                                            <div className="w-px h-5 bg-slate-250 mx-1"></div>
                                            
                                            {/* Image upload */}
                                            <label className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors cursor-pointer flex items-center justify-center" title="Insert Image">
                                                <FiImage className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>

                                            {/* Document attachment */}
                                            <label className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors cursor-pointer flex items-center justify-center" title="Attach Document (PDF, DOCX, etc)">
                                                <FiPaperclip className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                                                    onChange={handleDocumentUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        
                                        <div
                                            ref={editorRef}
                                            contentEditable
                                            onInput={handleEditorInput}
                                            className="rich-editor w-full px-4 py-3 text-sm min-h-[160px] max-h-[300px] overflow-y-auto focus:outline-none bg-white prose prose-sm max-w-none"
                                            data-placeholder="Write the details of the announcement here..."
                                            style={{ outline: 'none' }}
                                        />
                                    </div>
                                    
                                    {attachedFiles.length > 0 && (
                                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                            <span className="text-xs font-bold text-slate-500 block">Attachments ({attachedFiles.length})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {attachedFiles.map(file => (
                                                    <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs">
                                                        <span className="text-sm shrink-0">{file.type === "image" ? "🖼️" : "📄"}</span>
                                                        <span className="truncate font-medium text-slate-700 max-w-[150px]">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                                                            className="text-red-500 hover:text-red-750 font-bold shrink-0 ml-1.5 transition-colors"
                                                            title="Remove attachment"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6 py-2">
                                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-slate-500">Live Mockup Previews</span>
                                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">Interactive</span>
                                </div>
                                
                                {/* 1. Navbar Dropdown preview */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navbar Dropdown Item</h4>
                                    <div className="max-w-sm bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                        <div className="p-3 bg-slate-50/50 border-b border-slate-150 text-xs font-bold text-slate-700">Notifications dropdown preview</div>
                                        <div className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-2.5 items-start bg-orange-50/20 border-l-2 border-orange-500">
                                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                                                type === 'SUCCESS' ? 'bg-green-500' :
                                                type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-xs truncate font-bold text-slate-800">
                                                        {title || "Untitled Announcement"}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">Just now</span>
                                                </div>
                                                <div 
                                                    className="text-xs text-slate-500 line-clamp-2 leading-relaxed [&_img]:hidden [&_a]:text-blue-600 [&_a]:underline"
                                                    dangerouslySetInnerHTML={{ __html: getCompiledMessage() || '<span class="italic text-slate-400">Empty message</span>' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 2. Detailed Inbox preview */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full History Inbox Card</h4>
                                    <div className="bg-white p-5 rounded-xl border border-orange-200 bg-orange-50/5 ring-1 ring-orange-50 shadow-sm flex gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${
                                            type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                                            type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            <FiBell className="w-5 h-5" />
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pr-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                                                <h3 className="text-sm font-bold text-slate-900">
                                                    {title || "Untitled Announcement"}
                                                </h3>
                                                <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                                            </div>
                                            <div 
                                                className="text-xs text-slate-500 leading-relaxed font-medium prose prose-slate max-w-none [&_img]:max-h-60 [&_img]:rounded-lg [&_img]:mt-2 [&_img]:object-cover [&_a]:text-blue-600 [&_a]:underline"
                                                dangerouslySetInnerHTML={{ __html: getCompiledMessage() || '<span class="italic text-slate-400">Empty message</span>' }}
                                            />
                                            {targetUrl && (
                                                <button className="mt-3 text-xs font-bold text-orange-600 flex items-center gap-1">
                                                    View details <FiArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Target Audience */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audience</label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => {
                                        setTargetRole(e.target.value);
                                        setSelectedUser(null);
                                        setRecipientEmail("");
                                    }}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all text-sm cursor-pointer bg-white"
                                >
                                    <option value="ALL">All Users</option>
                                    <option value="ROLE_COMPANY_OWNER">Company Owners</option>
                                    <option value="ROLE_SERVICE_MANAGER">Service Managers</option>
                                    <option value="ROLE_CUSTOMER">Customers</option>
                                    <option value="PERSONAL">Single Specific User (Personal Alert)</option>
                                </select>
                            </div>

                            {/* Severity / Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Severity Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all text-sm cursor-pointer bg-white"
                                >
                                    <option value="INFO">Info (Blue)</option>
                                    <option value="WARNING">Warning (Amber)</option>
                                    <option value="SUCCESS">Success (Green)</option>
                                </select>
                            </div>
                        </div>

                        {/* Search target user by exact email if PERSONAL target role */}
                        {targetRole === "PERSONAL" && (
                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Recipient's Email Address (Exact Match)
                                </label>
                                <input
                                    type="email"
                                    value={recipientEmail}
                                    onChange={(e) => {
                                        const emailVal = e.target.value;
                                        setRecipientEmail(emailVal);
                                        const matched = users.find(u => u.email?.toLowerCase() === emailVal.trim().toLowerCase());
                                        setSelectedUser(matched || null);
                                    }}
                                    placeholder="e.g., charlie@example.com"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all text-sm bg-white"
                                    required
                                />
                                {selectedUser ? (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="text-xs">
                                            <div className="font-bold text-green-800">✓ User Identified</div>
                                            <div className="font-semibold text-slate-800">{selectedUser.fullName}</div>
                                            <div className="text-slate-500">{selectedUser.email}</div>
                                        </div>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                                            {selectedUser.role?.replace("ROLE_", "")}
                                        </span>
                                    </div>
                                ) : recipientEmail.trim() ? (
                                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
                                        ✗ Validation error: No user found in the system matching this email exactly.
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Redirect URL */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Redirect URL (Optional)
                            </label>
                            <input
                                type="text"
                                value={targetUrl}
                                onChange={(e) => setTargetUrl(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all text-sm"
                                placeholder="e.g., /dashboard/company-owner/finance"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                                Clicking the notification card will redirect users to this page route.
                            </span>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSending}
                                className={`px-6 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 ${
                                    isSending ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            >
                                {isSending ? (
                                    <>
                                        <FiLoader className="w-4 h-4 animate-spin" /> Broadcasting...
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="w-4 h-4" /> Send Announcement
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sent Notifications Log */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 flex flex-col h-full min-h-[600px]">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 shrink-0">
                        System Notifications Log
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[650px]">
                        {isLoadingLog ? (
                            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                                <FiLoader className="w-6 h-6 animate-spin text-orange-500" />
                                <span>Loading history...</span>
                            </div>
                        ) : log.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic text-center p-4">
                                <FiBell className="w-8 h-8 text-slate-300 mb-2" />
                                <span>No notifications have been generated or sent yet.</span>
                            </div>
                        ) : (
                            log.map((n, idx) => {
                                return (
                                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 shadow-xs hover:shadow-sm transition-all duration-200">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                n.type === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                                n.type === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {n.type}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{n.title}</h4>
                                        <div 
                                            className="text-xs text-slate-500 line-clamp-2 leading-relaxed [&_img]:hidden [&_.notif-attachment-link]:hidden font-medium"
                                            dangerouslySetInnerHTML={{ __html: n.message }}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
