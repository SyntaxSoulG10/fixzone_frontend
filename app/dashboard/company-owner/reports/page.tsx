"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
    Box,
    Typography,
    Card,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    Skeleton,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    LinearProgress,
    Fade,
    Checkbox,
    ListItemText,
    OutlinedInput,
    Grid,
    Alert,
    Tooltip
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
    FiDownload,
    FiFileText,
    FiSearch,
    FiFilter,
    FiCheckCircle,
    FiEye,
    FiTrash2,
    FiUploadCloud,
    FiCalendar,
    FiZap,
    FiInfo,
    FiClock,
    FiFile,
    FiMapPin,
    FiTag
} from "react-icons/fi";
import { getAllReports, createReport, deleteReport, ReportItem } from "@/services/reportService";
import FeedbackSnackbar, { SeverityType } from "@/components/UI/FeedbackSnackbar";
import StatCard from "@/components/dashboard/StatCard";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

import { useDashboardData } from "@/context/DashboardDataContext";

const availableSections = [
    "Executive Summary",
    "Key Metrics",
    "Detailed Data Table",
    "Chart Visualizations",
    "Raw Data Export"
];

const base64ToBlob = (base64Str: string, contentType: string = 'application/pdf') => {
    const base64Data = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
};

export default function ReportsPage() {
    const { centersData, analyticsData, bookingsData, invoicesData, ownerData } = useDashboardData();
    const branchOptions = useMemo(() => ["All Branches", ...(centersData || []).map((c: any) => c.name)], [centersData]);

    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("All");
    const [sourceFilter, setSourceFilter] = useState<"All" | "Generated" | "External">("All");

    const [openDialog, setOpenDialog] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<string | null>(null);

    // Report Details & Notes View Modal
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedReportDetails, setSelectedReportDetails] = useState<ReportItem | null>(null);

    // Upload from Local File Modal States
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadBase64, setUploadBase64] = useState<string>("");
    const [uploadForm, setUploadForm] = useState({
        name: "",
        type: "Audit",
        branch: "All Branches",
        description: ""
    });
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Snackbar Feedback State
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: SeverityType;
    }>({
        open: false,
        message: "",
        severity: "success"
    });

    const showSnackbar = (message: string, severity: SeverityType = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    // Native PDF Preview States
    const [previewGenerating, setPreviewGenerating] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [viewOnlyMode, setViewOnlyMode] = useState(false);
    const pdfDocRef = useRef<any>(null);

    const chartRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Compute unique default report name that does not collide with existing reports
    const getDefaultReportName = (type: string, existingList: ReportItem[] = reports) => {
        const baseName = `${type} Report - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        if (!existingList.some(r => r.name.trim().toLowerCase() === baseName.toLowerCase())) {
            return baseName;
        }
        let counter = 2;
        while (existingList.some(r => r.name.trim().toLowerCase() === `${baseName} (${counter})`.toLowerCase())) {
            counter++;
        }
        return `${baseName} (${counter})`;
    };

    const [newReport, setNewReport] = useState<{
        name: string;
        type: string;
        startDate: Date | null;
        endDate: Date | null;
        branch: string;
        sections: string[];
        description: string;
    }>({
        name: getDefaultReportName("Financial", []),
        type: "Financial",
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date(),
        branch: "All Branches",
        sections: ["Executive Summary", "Key Metrics", "Detailed Data Table", "Chart Visualizations"],
        description: ""
    });

    const [dateError, setDateError] = useState<string | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [sectionsError, setSectionsError] = useState<string | null>(null);

    const [reportData, setReportData] = useState<{
        kpi1: string;
        kpi2: string;
        kpi3: string;
        chartLabels: string[];
        chartDataValues: number[];
        tableData: string[][];
        summaryText: string;
    } | null>(null);

    const [generating, setGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const generationSteps = [
        "Capturing visualizations and chart assets...",
        "Gathering verified business records...",
        "Compiling analytics summary...",
        "Formatting enterprise PDF layout...",
        "Finalizing and saving document..."
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getAllReports();
            const sortedData = data.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setReports(sortedData);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            showSnackbar("Failed to load reports", "error");
        } finally {
            setLoading(false);
        }
    };

    // Classify whether a report was system-generated or externally uploaded
    const isExternalReport = (report: ReportItem): boolean => {
        if (report.type === 'External') return true;
        if (report.fileContentBase64 && !report.downloadUrl) return true;
        return false;
    };

    // Duplicate Name Validation
    const checkDuplicateName = (name: string, excludeId?: string): boolean => {
        const trimmed = name.trim().toLowerCase();
        if (!trimmed) return false;
        return reports.some(r => r.name.trim().toLowerCase() === trimmed && (!excludeId || r.id !== excludeId));
    };

    // Quick Date Range Presets
    const handleApplyDatePreset = (preset: '30days' | 'thisMonth' | 'lastQuarter' | 'ytd') => {
        const now = new Date();
        let start = new Date();
        const end = new Date();

        switch (preset) {
            case '30days':
                start.setDate(now.getDate() - 30);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastQuarter':
                start.setMonth(now.getMonth() - 3);
                break;
            case 'ytd':
                start = new Date(now.getFullYear(), 0, 1);
                break;
        }

        setNewReport(prev => ({ ...prev, startDate: start, endDate: end }));
        setDateError(null);
    };

    // Date Validation
    const validateDates = (start: Date | null, end: Date | null): boolean => {
        if (!start || !end) {
            setDateError("Both start and end dates are required.");
            return false;
        }
        if (start.getTime() > end.getTime()) {
            setDateError("Start date cannot exceed end date.");
            return false;
        }
        setDateError(null);
        return true;
    };

    // Trigger File Picker for Local Upload
    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            showSnackbar("Please upload a valid PDF document.", "warning");
            event.target.value = '';
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            showSnackbar("File size exceeds maximum allowed limit (20 MB).", "warning");
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setUploadFile(file);
            setUploadBase64(base64);
            const rawClean = file.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ');
            let candidateTitle = rawClean.charAt(0).toUpperCase() + rawClean.slice(1);
            
            // Check if uploaded candidate title already exists, if so append counter
            if (checkDuplicateName(candidateTitle)) {
                let count = 2;
                while (checkDuplicateName(`${candidateTitle} (${count})`)) {
                    count++;
                }
                candidateTitle = `${candidateTitle} (${count})`;
            }

            setUploadForm({
                name: candidateTitle,
                type: "Audit",
                branch: "All Branches",
                description: ""
            });
            setUploadError(null);
            setUploadModalOpen(true);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleSaveUploadModal = async () => {
        const cleanName = uploadForm.name.trim();
        if (!cleanName || cleanName.length < 3) {
            setUploadError("Please provide a valid document name (min 3 characters).");
            return;
        }

        if (checkDuplicateName(cleanName)) {
            setUploadError("A report with this title already exists. Please choose a unique name.");
            return;
        }

        if (!uploadBase64 || !uploadFile) {
            setUploadError("No file selected.");
            return;
        }

        setIsUploading(true);
        try {
            await createReport({
                name: cleanName,
                type: uploadForm.type,
                description: uploadForm.description.trim() || undefined,
                fileContentBase64: uploadBase64,
                size: (uploadFile.size / 1024 / 1024).toFixed(2) + " MB"
            } as any);

            showSnackbar("Document uploaded and archived successfully!", "success");
            setUploadModalOpen(false);
            setUploadFile(null);
            setUploadBase64("");
            fetchReports();
        } catch (err: any) {
            console.error(err);
            const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Upload failed";
            setUploadError(`Upload failed: ${backendMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenDetails = (report: ReportItem) => {
        setSelectedReportDetails(report);
        setDetailsModalOpen(true);
    };

    const handleViewReport = async (row: ReportItem) => {
        if (row.fileContentBase64) {
            try {
                const blob = base64ToBlob(row.fileContentBase64);
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            } catch(e) {
                console.error("PDF View Error: ", e);
                showSnackbar("Failed to load PDF.", "error");
            }
        } else if (row.downloadUrl && row.downloadUrl.startsWith('http')) {
            window.open(row.downloadUrl, '_blank');
        } else {
            showSnackbar("Generating document preview...", "info");

            setTimeout(() => {
                const isFinancial = row.type === 'Financial';
                const totalRev = analyticsData?.totalRevenue || 0;
                const totalJobs = analyticsData?.totalJobs || (bookingsData?.length || 0);
                const activeCentersCount = (centersData?.filter((c: any) => c.isActive)?.length || 0);

                const mockData = {
                    kpi1: isFinancial ? `Rs. ${totalRev.toLocaleString('en-LK')}` : `${totalJobs} Jobs`,
                    kpi2: analyticsData?.revenueChange || "+0%",
                    kpi3: `${activeCentersCount} Active Centers`,
                    tableData: (analyticsData?.topCenters && analyticsData.topCenters.length > 0)
                        ? analyticsData.topCenters.map((tc: any, i: number) => [
                            `#CTR-${i + 1}`,
                            tc.name || `Branch ${i + 1}`,
                            isFinancial ? `Rs. ${Number(tc.revenue || 0).toLocaleString('en-LK')}` : `${tc.jobs || 0} Jobs`,
                            'Active'
                        ])
                        : [['#1001', 'General Operations', isFinancial ? 'Rs. 0' : '0 Jobs', 'Completed']],
                    summaryText: row.description || `Archived ${row.type.toLowerCase()} report summary for ${ownerData?.companyName || 'FixZone Automotive'}.`
                };

                const mockReportObj = {
                    name: row.name,
                    type: row.type,
                    branch: "All Branches",
                    sections: ["Executive Summary", "Key Metrics", "Detailed Data Table"]
                };

                try {
                    const doc = generatePDFDoc(mockReportObj, undefined, mockData);
                    const url = doc.output('bloburl').toString();
                    window.open(url, '_blank');
                } catch(e) {
                    console.error(e);
                    showSnackbar("Failed to generate PDF.", "error");
                }
            }, 300);
        }
    };

    const handlePreviewReport = () => {
        let isValid = true;
        const cleanName = newReport.name.trim();

        if (!cleanName || cleanName.length < 3) {
            setTitleError("Report title must be at least 3 characters.");
            isValid = false;
        } else if (checkDuplicateName(cleanName)) {
            setTitleError("A report with this title already exists. Please choose a unique name.");
            isValid = false;
        } else {
            setTitleError(null);
        }

        if (!validateDates(newReport.startDate, newReport.endDate)) {
            isValid = false;
        }

        if (!newReport.sections || newReport.sections.length === 0) {
            setSectionsError("Please select at least one section to include.");
            isValid = false;
        } else {
            setSectionsError(null);
        }

        if (!isValid) return;

        setPreviewMode(true);
        setPreviewGenerating(true);
        setViewOnlyMode(false);

        const isFinancial = newReport.type === 'Financial';
        const totalRev = analyticsData?.totalRevenue || 0;
        const totalJobs = analyticsData?.totalJobs || (bookingsData?.length || 0);
        const activeCentersCount = (centersData?.filter((c: any) => c.isActive)?.length || 0);

        const kpi1 = isFinancial 
            ? `Rs. ${totalRev.toLocaleString('en-LK')}` 
            : `${totalJobs} Jobs`;
        const kpi2 = analyticsData?.revenueChange || "+0%";
        const kpi3 = `${activeCentersCount} Active Locations`;

        const chartLabels = (analyticsData?.revenueOverview && analyticsData.revenueOverview.length > 0)
            ? analyticsData.revenueOverview.map((item: any) => item.name)
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const chartDataValues = (analyticsData?.revenueOverview && analyticsData.revenueOverview.length > 0)
            ? analyticsData.revenueOverview.map((item: any) => item.revenue)
            : [0, 0, 0, 0, 0, 0];

        const tableData = (analyticsData?.topCenters && analyticsData.topCenters.length > 0)
            ? analyticsData.topCenters.map((tc: any, i: number) => [
                `#CTR-${i + 1}`,
                tc.name || `Branch ${i + 1}`,
                isFinancial ? `Rs. ${Number(tc.revenue || 0).toLocaleString('en-LK')}` : `${tc.jobs || 0} Jobs`,
                'Active'
            ])
            : (centersData && centersData.length > 0)
                ? centersData.map((c: any, i: number) => [
                    `#CTR-${i + 1}`,
                    c.name,
                    c.location || 'Active',
                    c.isActive ? 'Active' : 'Disabled'
                ])
                : [['#1001', 'General Service Operations', isFinancial ? 'Rs. 0' : '0 Jobs', 'Completed']];

        const summaryText = newReport.description.trim() 
            ? newReport.description.trim() 
            : `This report provides a comprehensive overview of ${newReport.type.toLowerCase()} operations for ${newReport.branch || 'all branches'} within the selected timeframe for ${ownerData?.companyName || 'FixZone Automotive'}. All metrics reflect real-time business activity and verified customer transactions. Ensure all confidential information is handled appropriately according to FixZone policies.`;

        setReportData({ kpi1, kpi2, kpi3, chartLabels, chartDataValues, tableData, summaryText });
    };

    useEffect(() => {
        if (previewGenerating && reportData && chartRef.current) {
            const timer = setTimeout(() => {
                try {
                    const chartImage = chartRef.current?.canvas?.toDataURL('image/png');
                    const doc = generatePDFDoc(newReport, chartImage, reportData);
                    pdfDocRef.current = doc;

                    const blobUrl = doc.output('bloburl');
                    setPdfPreviewUrl(blobUrl.toString());
                    setPreviewGenerating(false);
                } catch(e) {
                    console.error("PDF generation error", e);
                    setPreviewGenerating(false);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [previewGenerating, reportData]);

    const generatePDFDoc = (report: any, chartImage: string | undefined, data: any) => {
        const doc = new jsPDF();

        // Professional Brand Header
        doc.setFillColor(255, 247, 237);
        doc.rect(0, 0, 210, 42, "F");

        doc.setFillColor(234, 88, 12);
        doc.rect(0, 0, 6, 42, "F");

        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text(ownerData?.companyName || "FixZone Automotive Network", 16, 22);

        doc.setFontSize(11);
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "normal");
        doc.text("Official Enterprise Analytics & Operations Report", 16, 31);

        let currentY = 54;

        // Metadata Box
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text("Document Overview", 14, currentY);
        currentY += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`Document Title: ${report.name}`, 14, currentY); currentY += 6;
        doc.text(`Category: ${report.type}`, 14, currentY); currentY += 6;

        const startStr = report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A';
        const endStr = report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A';
        doc.text(`Date Range: ${startStr} - ${endStr}`, 14, currentY); currentY += 6;

        doc.text(`Target Scope: ${report.branch || 'All Branches'}`, 14, currentY); currentY += 12;

        // Executive Summary
        if (report.sections?.includes("Executive Summary") || !report.sections) {
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.text("Executive Summary & Remarks", 14, currentY);
            currentY += 8;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            const splitText = doc.splitTextToSize(data.summaryText, 180);
            doc.text(splitText, 14, currentY);
            currentY += (splitText.length * 5) + 10;
        }

        // Key Metrics
        if (report.sections?.includes("Key Metrics") || !report.sections) {
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.text("Performance Highlights", 14, currentY);
            currentY += 8;

            doc.setFillColor(248, 250, 252);
            doc.roundedRect(14, currentY, 56, 22, 2, 2, "F");
            doc.roundedRect(77, currentY, 56, 22, 2, 2, "F");
            doc.roundedRect(140, currentY, 56, 22, 2, 2, "F");

            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(report.type === 'Financial' ? "TOTAL REVENUE" : "VOLUME / JOBS", 18, currentY + 7);
            doc.text("GROWTH (MOM)", 81, currentY + 7);
            doc.text("FACILITY SCOPE", 144, currentY + 7);

            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.text(data.kpi1, 18, currentY + 16);
            doc.text(data.kpi2, 81, currentY + 16);
            doc.text(data.kpi3, 144, currentY + 16);

            currentY += 30;
        }

        // Chart Visualizations
        if (report.sections?.includes("Chart Visualizations") || !report.sections) {
            if (chartImage) {
                if (currentY > 180) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFontSize(13);
                doc.setTextColor(15, 23, 42);
                doc.setFont("helvetica", "bold");
                doc.text("Visual Analytics", 14, currentY);
                currentY += 8;

                doc.addImage(chartImage, 'PNG', 14, currentY, 182, 80);
                currentY += 90;
            }
        }

        // Data Table
        if (report.sections?.includes("Detailed Data Table") || !report.sections) {
            if (currentY > 215) {
                doc.addPage();
                currentY = 20;
            }

            autoTable(doc, {
                startY: currentY,
                head: [['ID / Code', 'Center / Entity Description', 'Performance / Metric', 'Operating Status']],
                body: data.tableData,
                theme: 'striped',
                headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9.5, cellPadding: 5, textColor: [30, 41, 59] },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { top: 10, left: 14, right: 14 }
            });
        }

        // Footer with Page Numbers
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8.5);
            doc.setTextColor(148, 163, 184);
            doc.text(
                `Page ${i} of ${pageCount} • FixZone Automotive Multi-Tenant Platform • Confidential`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        return doc;
    };

    const handleExportFromPreview = async () => {
        try {
            setGenerating(true);
            setGenerationStep(0);
            setProgress(0);

            for (let i = 0; i < generationSteps.length; i++) {
                setGenerationStep(i);
                const targetProgress = ((i + 1) / generationSteps.length) * 100;

                await new Promise(resolve => {
                    let currentP = (i / generationSteps.length) * 100;
                    const interval = setInterval(() => {
                        currentP += 2;
                        if (currentP >= targetProgress) {
                            clearInterval(interval);
                            setProgress(targetProgress);
                            resolve(true);
                        } else {
                            setProgress(currentP);
                        }
                    }, 40);
                });
            }

            await createReport({
                name: newReport.name.trim(),
                type: newReport.type,
                description: newReport.description.trim() || undefined
            });

            if (pdfDocRef.current) {
                const filename = `${newReport.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
                pdfDocRef.current.save(filename);
            }

            showSnackbar("Report generated and exported successfully!", "success");

            setOpenDialog(false);
            setPreviewMode(false);
            setPdfPreviewUrl(null);
            pdfDocRef.current = null;

            setNewReport({
                name: getDefaultReportName("Financial"),
                type: "Financial",
                startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                endDate: new Date(),
                branch: "All Branches",
                sections: ["Executive Summary", "Key Metrics", "Detailed Data Table", "Chart Visualizations"],
                description: ""
            });
            setDateError(null);
            setTitleError(null);
            setSectionsError(null);
            await fetchReports();
        } catch (error) {
            console.error("Failed to generate report", error);
            showSnackbar("Failed to generate report. Please try again.", "error");
        } finally {
            setGenerating(false);
            setTimeout(() => {
                setProgress(0);
                setGenerationStep(0);
            }, 500);
        }
    };

    // Filter Logic (Search, Category, and Origin Source)
    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase())
                || (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType = typeFilter === "All" || report.type === typeFilter;
            const isExt = isExternalReport(report);
            const matchesSource = sourceFilter === "All" 
                || (sourceFilter === "Generated" && !isExt) 
                || (sourceFilter === "External" && isExt);

            return matchesSearch && matchesType && matchesSource;
        });
    }, [reports, searchQuery, typeFilter, sourceFilter]);

    const reportTypes = useMemo(() => {
        const set = new Set(reports.map(r => r.type).filter(Boolean));
        return ["All", ...Array.from(set)];
    }, [reports]);

    // Derived Statistics
    const generatedCount = reports.filter(r => !isExternalReport(r)).length;
    const externalCount = reports.filter(r => isExternalReport(r)).length;
    const latestReport = reports.length > 0 ? (reports[0].date || reports[0].createdAt?.split('T')[0] || 'Today') : 'None';

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Report Title & Notes",
            flex: 1.6,
            minWidth: 280,
            renderCell: (params: GridRenderCellParams) => {
                const isExt = isExternalReport(params.row);
                const hasNotes = Boolean(params.row.description && params.row.description.trim());
                return (
                    <Box display="flex" alignItems="center" gap={1.5} height="100%">
                        <Box 
                            sx={{ 
                                width: 38, 
                                height: 38, 
                                borderRadius: '10px', 
                                bgcolor: isExt ? 'rgba(100, 116, 139, 0.1)' : 'rgba(234, 88, 12, 0.1)', 
                                color: isExt ? '#475569' : '#ea580c',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            {isExt ? <FiUploadCloud size={18} /> : <FiZap size={18} />}
                        </Box>
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="body2" fontWeight={700} color="#1e293b" noWrap>
                                {params.value}
                            </Typography>
                            {hasNotes ? (
                                <Typography 
                                    variant="caption" 
                                    color="primary.main" 
                                    sx={{ 
                                        display: 'block', 
                                        fontWeight: 600, 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' } 
                                    }} 
                                    onClick={() => handleOpenDetails(params.row)}
                                    noWrap
                                >
                                    💬 {params.row.description}
                                </Typography>
                            ) : (
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {isExt ? "Uploaded Document" : "Platform Generated"}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            }
        },
        {
            field: "source",
            headerName: "Source / Origin",
            width: 170,
            valueGetter: (value, row) => isExternalReport(row) ? "External Document" : "System Generated",
            renderCell: (params: GridRenderCellParams) => {
                const isExt = isExternalReport(params.row);
                return (
                    <Box display="flex" alignItems="center" height="100%">
                        <Chip 
                            icon={isExt ? <FiUploadCloud size={13} /> : <FiZap size={13} />}
                            label={isExt ? "External Upload" : "System Generated"} 
                            size="small" 
                            sx={{ 
                                fontWeight: 700, 
                                fontSize: '0.72rem',
                                bgcolor: isExt ? '#f1f5f9' : 'rgba(234, 88, 12, 0.08)',
                                color: isExt ? '#475569' : '#c2410c',
                                border: `1px solid ${isExt ? '#cbd5e1' : 'rgba(234, 88, 12, 0.25)'}`,
                                '& .MuiChip-icon': {
                                    color: isExt ? '#64748b' : '#ea580c'
                                }
                            }} 
                        />
                    </Box>
                );
            }
        },
        {
            field: "type",
            headerName: "Category",
            width: 140,
            renderCell: (params: GridRenderCellParams) => {
                let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
                switch(params.value) {
                    case 'Financial': color = 'success'; break;
                    case 'Analytics': color = 'primary'; break;
                    case 'Audit': color = 'warning'; break;
                    case 'Feedback': color = 'secondary'; break;
                    default: color = 'primary';
                }
                return (
                    <Box display="flex" alignItems="center" height="100%">
                        <Chip label={params.value} size="small" color={color} variant="outlined" sx={{ fontWeight: 600 }} />
                    </Box>
                );
            }
        },
        {
            field: "date",
            headerName: "Date Generated",
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={0.75} height="100%" color="text.secondary">
                    <FiCalendar size={14} />
                    <Typography variant="body2">
                        {params.value || params.row.createdAt?.split('T')[0] || "Recent"}
                    </Typography>
                </Box>
            )
        },
        {
            field: "size",
            headerName: "File Size",
            width: 110,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', height: '100%', fontWeight: 500 }}>
                    {params.value || "1.2 MB"}
                </Typography>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={0.5} height="100%">
                    <Tooltip title="View Details & Notes">
                        <IconButton 
                            color="default" 
                            size="small"
                            onClick={() => handleOpenDetails(params.row)}
                            sx={{ color: '#64748b', '&:hover': { color: '#ea580c' } }}
                        >
                            <FiInfo size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="View / Open PDF">
                        <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleViewReport(params.row)}
                        >
                            <FiEye size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                        <IconButton 
                            color="primary" 
                            size="small"
                            onClick={async () => {
                                if (params.row.fileContentBase64) {
                                    try {
                                        const blob = base64ToBlob(params.row.fileContentBase64);
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${params.row.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
                                        a.click();
                                        showSnackbar(`Downloaded ${params.row.name}!`, "success");
                                    } catch (e) {
                                        console.error("Download Error: ", e);
                                        showSnackbar("Failed to download PDF.", "error");
                                    }
                                    return;
                                }
                                
                                if (params.row.downloadUrl && params.row.downloadUrl.startsWith('http')) {
                                    const a = document.createElement('a');
                                    a.href = params.row.downloadUrl;
                                    a.target = '_blank';
                                    a.download = `${params.row.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
                                    a.click();
                                    showSnackbar(`Downloaded ${params.row.name}!`, "success");
                                    return;
                                }

                                const isFinancial = params.row.type === 'Financial';
                                const totalRev = analyticsData?.totalRevenue || 0;
                                const totalJobs = analyticsData?.totalJobs || (bookingsData?.length || 0);
                                const activeCentersCount = (centersData?.filter((c: any) => c.isActive)?.length || 0);

                                const reportPayload = {
                                    kpi1: isFinancial ? `Rs. ${totalRev.toLocaleString('en-LK')}` : `${totalJobs} Jobs`,
                                    kpi2: analyticsData?.revenueChange || "+0%",
                                    kpi3: `${activeCentersCount} Active Centers`,
                                    tableData: (analyticsData?.topCenters && analyticsData.topCenters.length > 0)
                                        ? analyticsData.topCenters.map((tc: any, i: number) => [
                                            `#CTR-${i + 1}`,
                                            tc.name || `Branch ${i + 1}`,
                                            isFinancial ? `Rs. ${Number(tc.revenue || 0).toLocaleString('en-LK')}` : `${tc.jobs || 0} Jobs`,
                                            'Active'
                                        ])
                                        : [['#1001', 'General Operations', isFinancial ? 'Rs. 0' : '0 Jobs', 'Completed']],
                                    summaryText: params.row.description || `Archived ${params.row.type.toLowerCase()} report summary for ${ownerData?.companyName || 'FixZone Automotive'}.`
                                };
                                
                                const reportObj = {
                                    name: params.row.name,
                                    type: params.row.type,
                                    branch: "Historical Archive",
                                    sections: ["Executive Summary", "Key Metrics", "Detailed Data Table"]
                                };

                                try {
                                    showSnackbar(`Preparing ${params.row.name}...`, "info");
                                    const doc = generatePDFDoc(reportObj, undefined, reportPayload);
                                    doc.save(`${params.row.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
                                    showSnackbar(`Downloaded ${params.row.name}!`, "success");
                                } catch (e) {
                                    console.error("Error downloading report:", e);
                                    showSnackbar("Error downloading report.", "error");
                                }
                            }}
                        >
                            <FiDownload size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Record">
                        <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => {
                                setReportToDelete(params.row.id);
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <FiTrash2 size={16} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false as const,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: false },
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box pb={4}>
                <FeedbackSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                />

                {/* Page Header */}
                <Box mb={4} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color="#1e293b" gutterBottom>
                            Enterprise Reports & Documents
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Generate analytical business reports or upload external audit and compliance documents.
                        </Typography>
                    </Box>
                    <Box display="flex" gap={1.5} flexWrap="wrap">
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handleFileSelected} 
                        />
                        <Button 
                            variant="outlined" 
                            startIcon={<FiUploadCloud />}
                            sx={{ 
                                borderRadius: '0.75rem', 
                                px: 2.5, 
                                py: 1.1, 
                                bgcolor: '#fff', 
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload Document
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<FiZap />}
                            sx={{ 
                                borderRadius: '0.75rem', 
                                px: 3, 
                                py: 1.1,
                                background: 'linear-gradient(195deg, #FB923C, #EA580C)',
                                color: '#ffffff !important',
                                textTransform: 'none',
                                fontWeight: 700,
                                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(195deg, #ea580c, #c2410c)',
                                    boxShadow: '0 6px 20px rgba(234, 88, 12, 0.45)',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                            onClick={() => {
                                setPreviewMode(false);
                                setPdfPreviewUrl(null);
                                setViewOnlyMode(false);
                                setDateError(null);
                                setTitleError(null);
                                setSectionsError(null);
                                setNewReport(prev => ({
                                    ...prev,
                                    name: getDefaultReportName(prev.type)
                                }));
                                setOpenDialog(true);
                            }}
                        >
                            Generate New Report
                        </Button>
                    </Box>
                </Box>

                {/* Top Stat Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard
                            title="Total Reports"
                            count={reports.length.toString()}
                            percentage={{ color: 'primary', amount: `${reports.length}`, label: 'cataloged' }}
                            icon={<FiFileText />}
                            color="primary"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard
                            title="Platform Generated"
                            count={generatedCount.toString()}
                            percentage={{ color: 'primary', amount: `${generatedCount}`, label: 'auto-compiled' }}
                            icon={<FiZap />}
                            color="primary"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard
                            title="External Uploads"
                            count={externalCount.toString()}
                            percentage={{ color: 'primary', amount: `${externalCount}`, label: 'audits & files' }}
                            icon={<FiUploadCloud />}
                            color="primary"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard
                            title="Latest Activity"
                            count={latestReport}
                            percentage={{ color: 'primary', amount: 'Updated', label: 'live archive' }}
                            icon={<FiClock />}
                            color="primary"
                        />
                    </Grid>
                </Grid>

                {/* Hidden Chart for PDF Generation */}
                <Box sx={{ position: 'absolute', top: -9999, left: -9999, width: 800, height: 400, opacity: 0 }}>
                    {reportData && (
                        <Bar ref={chartRef} options={chartOptions} data={{
                            labels: reportData.chartLabels,
                            datasets: [{
                                label: newReport.type === 'Financial' ? 'Revenue (Rs.)' : 'Volume (Units)',
                                data: reportData.chartDataValues,
                                backgroundColor: 'rgba(234, 88, 12, 0.7)',
                                borderColor: 'rgba(234, 88, 12, 1)',
                                borderWidth: 1,
                            }]
                        }} />
                    )}
                </Box>

                {/* Polished Clean Filter Card without Stretching Divider */}
                <Card sx={{ p: 2.5, mb: 3, borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <Stack spacing={2}>
                        {/* Row 1: Search Input & Source Origin Chips */}
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" gap={2}>
                            <TextField
                                placeholder="Search reports by title or notes..."
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ minWidth: { xs: '100%', md: 340 }, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FiSearch color="#94a3b8" />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                            />

                            {/* Source Filter (All / Generated / External) */}
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={0.5} mr={0.5} color="text.secondary">
                                    <FiFilter size={15} />
                                    <Typography variant="caption" fontWeight={700} color="#475569" textTransform="uppercase">Origin:</Typography>
                                </Box>
                                {(["All", "Generated", "External"] as const).map((source) => (
                                    <Chip
                                        key={source}
                                        label={source === 'All' ? 'All Sources' : source === 'Generated' ? 'Platform Generated' : 'External Uploads'}
                                        onClick={() => setSourceFilter(source)}
                                        color={sourceFilter === source ? "primary" : "default"}
                                        variant={sourceFilter === source ? "filled" : "outlined"}
                                        size="small"
                                        sx={{ borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700 }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Row 2: Category Filter Chips */}
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" pt={1.5} borderTop="1px dashed #e2e8f0">
                            <Typography variant="caption" fontWeight={700} color="#475569" textTransform="uppercase" mr={0.5}>
                                Categories:
                            </Typography>
                            {reportTypes.map((type) => (
                                <Chip 
                                    key={type} 
                                    label={type} 
                                    onClick={() => setTypeFilter(type)}
                                    color={typeFilter === type ? "primary" : "default"}
                                    variant={typeFilter === type ? "filled" : "outlined"}
                                    size="small"
                                    sx={{ borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                                />
                            ))}
                        </Box>
                    </Stack>
                </Card>

                {/* Reports Data Table */}
                <Card sx={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    {loading ? (
                        <Box p={3}>
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1 }} />
                            ))}
                        </Box>
                    ) : (
                        <DataGrid
                            rows={filteredReports}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 10 },
                                },
                            }}
                            pageSizeOptions={[5, 10, 25]}
                            disableRowSelectionOnClick
                            autoHeight
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                                '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase'
                                },
                                '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9' }
                            }}
                        />
                    )}
                </Card>

                {/* 1. Modal: Upload External Document from Local File */}
                <Dialog
                    open={uploadModalOpen}
                    onClose={() => !isUploading && setUploadModalOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
                >
                    <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>
                        Upload External Document / Report
                    </DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                            {uploadError && (
                                <Alert severity="error" onClose={() => setUploadError(null)}>
                                    {uploadError}
                                </Alert>
                            )}

                            {uploadFile && (
                                <Box p={1.75} bgcolor="#f8fafc" borderRadius="10px" border="1px solid #e2e8f0" display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Box p={1} bgcolor="rgba(234, 88, 12, 0.1)" borderRadius="8px">
                                            <FiFileText color="#ea580c" size={20} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={700} color="#1e293b">
                                                {uploadFile.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                PDF Document • {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip label="Ready to Upload" size="small" color="success" sx={{ fontWeight: 700 }} />
                                </Box>
                            )}

                            <TextField
                                label="Document Title / Name"
                                fullWidth
                                required
                                size="small"
                                value={uploadForm.name}
                                error={checkDuplicateName(uploadForm.name)}
                                helperText={
                                    checkDuplicateName(uploadForm.name)
                                        ? "A report with this title already exists. Please choose a unique name."
                                        : "Provide a unique, descriptive title for this document"
                                }
                                onChange={(e) => {
                                    setUploadForm({ ...uploadForm, name: e.target.value });
                                    setUploadError(null);
                                }}
                                disabled={isUploading}
                                placeholder="e.g. Q3 Regional Audit Summary 2026"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Category / Type</InputLabel>
                                    <Select
                                        value={uploadForm.type}
                                        label="Category / Type"
                                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                                        disabled={isUploading}
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        <MenuItem value="Audit">Audit & Compliance</MenuItem>
                                        <MenuItem value="Financial">Financial Statement</MenuItem>
                                        <MenuItem value="Analytics">Analytics & Performance</MenuItem>
                                        <MenuItem value="Operational">Operational / Workshop</MenuItem>
                                        <MenuItem value="HR">HR & Staffing</MenuItem>
                                        <MenuItem value="Feedback">Customer Feedback</MenuItem>
                                        <MenuItem value="External">General External Doc</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel>Target Branch / Scope</InputLabel>
                                    <Select
                                        value={uploadForm.branch}
                                        label="Target Branch / Scope"
                                        onChange={(e) => setUploadForm({ ...uploadForm, branch: e.target.value })}
                                        disabled={isUploading}
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        {branchOptions.map((b) => (
                                            <MenuItem key={b} value={b}>{b}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <TextField
                                label="Notes / Description (Optional)"
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                value={uploadForm.description}
                                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                disabled={isUploading}
                                placeholder="Add context, auditing remarks, or memo details for this document..."
                                helperText="Notes will be saved and visible in the document details modal"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setUploadModalOpen(false)} disabled={isUploading} color="inherit">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveUploadModal} 
                            variant="contained" 
                            disabled={isUploading || !uploadForm.name.trim() || checkDuplicateName(uploadForm.name)}
                            startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <FiUploadCloud />}
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                                background: 'linear-gradient(195deg, #FB923C, #EA580C)',
                                color: '#fff',
                                fontWeight: 700,
                                textTransform: 'none'
                            }}
                        >
                            {isUploading ? "Uploading..." : "Save & Archive Document"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* 2. Modal: Generate Enterprise Report */}
                <Dialog 
                    open={openDialog} 
                    onClose={() => !generating && setOpenDialog(false)} 
                    maxWidth={previewMode ? "lg" : "md"}
                    fullWidth 
                    PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', transition: 'max-width 0.3s ease' } }}
                    transitionDuration={400}
                >
                    <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem', bgcolor: previewMode ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                        {generating ? "Exporting Enterprise Document" : previewMode ? "Native PDF Preview" : "Generate Custom Report"}
                    </DialogTitle>
                    <DialogContent sx={{ bgcolor: previewMode && !generating ? '#525659' : 'transparent', p: previewMode && !generating && !previewGenerating ? 0 : 3 }}>
                        {generating ? (
                            <Box py={6} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={4}>
                                <Box position="relative" display="inline-flex">
                                    <CircularProgress variant="determinate" value={100} size={110} thickness={4} sx={{ color: 'rgba(0,0,0,0.05)', position: 'absolute' }} />
                                    <CircularProgress variant="determinate" value={progress} size={110} thickness={4} sx={{ strokeLinecap: 'round' }} />
                                    <Box
                                        top={0} left={0} bottom={0} right={0}
                                        position="absolute" display="flex"
                                        alignItems="center" justifyContent="center"
                                    >
                                        <Typography variant="h5" component="div" color="text.secondary" fontWeight="bold">
                                            {Math.round(progress)}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box textAlign="center" width="100%">
                                    <Typography variant="h6" color="text.primary" gutterBottom>
                                        Processing Document...
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ minHeight: 24, fontWeight: 'medium' }}>
                                        {generationSteps[generationStep] || "Completing..."}
                                    </Typography>
                                </Box>
                                <Box width="100%" px={4}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={progress} 
                                        sx={{ 
                                            borderRadius: 2, 
                                            height: 8,
                                            backgroundColor: 'rgba(0,0,0,0.05)',
                                            '& .MuiLinearProgress-bar': { borderRadius: 2 }
                                        }} 
                                    />
                                </Box>
                            </Box>
                        ) : previewGenerating ? (
                            <Fade in={previewGenerating}>
                                <Box py={8} display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="rgba(0,0,0,0.02)">
                                    <CircularProgress color="primary" />
                                    <Typography mt={2} color="text.secondary" fontWeight="medium">Rendering Native PDF Document Preview...</Typography>
                                </Box>
                            </Fade>
                        ) : previewMode && pdfPreviewUrl ? (
                            <Fade in={!previewGenerating}>
                                <Box sx={{ width: '100%', height: '70vh', display: 'flex', flexDirection: 'column' }}>
                                    <iframe 
                                        src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 'none', flex: 1 }} 
                                        title="PDF Preview"
                                    />
                                </Box>
                            </Fade>
                        ) : (
                            <Box mt={1} display="flex" flexDirection="column" gap={3}>
                                {dateError && (
                                    <Alert severity="error">
                                        {dateError}
                                    </Alert>
                                )}

                                <TextField
                                    label="Report Title"
                                    fullWidth
                                    required
                                    variant="outlined"
                                    value={newReport.name}
                                    error={Boolean(titleError) || checkDuplicateName(newReport.name)}
                                    helperText={
                                        titleError 
                                            ? titleError 
                                            : checkDuplicateName(newReport.name)
                                                ? "A report with this title already exists. Please choose a unique name."
                                                : "Unique title for the generated document"
                                    }
                                    onChange={(e) => {
                                        setNewReport({ ...newReport, name: e.target.value });
                                        if (e.target.value.trim().length >= 3 && !checkDuplicateName(e.target.value)) {
                                            setTitleError(null);
                                        }
                                    }}
                                    disabled={generating}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                />

                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Report Category</InputLabel>
                                        <Select
                                            value={newReport.type}
                                            label="Report Category"
                                            onChange={(e) => {
                                                const type = e.target.value;
                                                setNewReport(prev => ({ 
                                                    ...prev, 
                                                    type,
                                                    name: prev.name.startsWith(prev.type) ? getDefaultReportName(type) : prev.name
                                                }));
                                            }}
                                            disabled={generating}
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            <MenuItem value="Financial">Financial</MenuItem>
                                            <MenuItem value="Analytics">Analytics</MenuItem>
                                            <MenuItem value="Audit">Audit</MenuItem>
                                            <MenuItem value="Feedback">Feedback</MenuItem>
                                            <MenuItem value="Operational">Operational</MenuItem>
                                            <MenuItem value="HR">HR & Staffing</MenuItem>
                                            <MenuItem value="Executive">Executive Summary</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth>
                                        <InputLabel>Target Branch / Facility</InputLabel>
                                        <Select
                                            value={newReport.branch}
                                            label="Target Branch / Facility"
                                            onChange={(e) => setNewReport({ ...newReport, branch: e.target.value })}
                                            disabled={generating}
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            {branchOptions.map((b) => (
                                                <MenuItem key={b} value={b}>{b}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>

                                {/* Date Presets */}
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={1}>
                                        DATE RANGE PRESETS
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip label="Last 30 Days" size="small" onClick={() => handleApplyDatePreset('30days')} clickable sx={{ borderRadius: '6px', fontWeight: 600 }} />
                                        <Chip label="This Month" size="small" onClick={() => handleApplyDatePreset('thisMonth')} clickable sx={{ borderRadius: '6px', fontWeight: 600 }} />
                                        <Chip label="Last Quarter (90d)" size="small" onClick={() => handleApplyDatePreset('lastQuarter')} clickable sx={{ borderRadius: '6px', fontWeight: 600 }} />
                                        <Chip label="Year to Date (YTD)" size="small" onClick={() => handleApplyDatePreset('ytd')} clickable sx={{ borderRadius: '6px', fontWeight: 600 }} />
                                    </Stack>
                                </Box>

                                {/* Custom Date Pickers with Strict Bounds */}
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                    <DatePicker
                                        label="Start Date *"
                                        value={newReport.startDate}
                                        maxDate={newReport.endDate || undefined}
                                        onChange={(newValue) => {
                                            setNewReport({ ...newReport, startDate: newValue });
                                            validateDates(newValue, newReport.endDate);
                                        }}
                                        sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                    <DatePicker
                                        label="End Date *"
                                        value={newReport.endDate}
                                        minDate={newReport.startDate || undefined}
                                        onChange={(newValue) => {
                                            setNewReport({ ...newReport, endDate: newValue });
                                            validateDates(newReport.startDate, newValue);
                                        }}
                                        sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                    />
                                </Stack>

                                <FormControl fullWidth error={Boolean(sectionsError)}>
                                    <InputLabel>Include Sections *</InputLabel>
                                    <Select
                                        multiple
                                        value={newReport.sections}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const sec = typeof value === 'string' ? value.split(',') : value;
                                            setNewReport({ ...newReport, sections: sec });
                                            if (sec.length > 0) setSectionsError(null);
                                        }}
                                        input={<OutlinedInput label="Include Sections *" sx={{ borderRadius: '8px' }} />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" color="primary" variant="outlined" />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {availableSections.map((section) => (
                                            <MenuItem key={section} value={section}>
                                                <Checkbox checked={newReport.sections.indexOf(section) > -1} />
                                                <ListItemText primary={section} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {sectionsError && (
                                        <Typography variant="caption" color="error" mt={0.5} ml={1.5}>
                                            {sectionsError}
                                        </Typography>
                                    )}
                                </FormControl>

                                <TextField
                                    label="Notes & Context (Optional)"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    size="small"
                                    value={newReport.description}
                                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                                    disabled={generating}
                                    placeholder="Add executive remarks, auditing context, or specific notes to accompany this report..."
                                    helperText="Notes are saved with the report and included in the executive summary"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, pt: previewMode && !generating ? 3 : undefined, justifyContent: 'space-between', bgcolor: previewMode && !generating ? '#fff' : 'transparent', borderTop: previewMode && !generating ? '1px solid #eee' : 'none' }}>
                        {!generating && (
                            <Button 
                                onClick={() => {
                                    if (previewMode) {
                                        setPreviewMode(false);
                                        setPdfPreviewUrl(null);
                                    } else {
                                        setOpenDialog(false);
                                    }
                                }} 
                                color="inherit" 
                                size="large"
                            >
                                {previewMode ? "Back to Edit" : "Cancel"}
                            </Button>
                        )}
                        
                        {previewMode && !generating && !viewOnlyMode ? (
                            <Button 
                                onClick={handleExportFromPreview} 
                                variant="contained" 
                                color="primary" 
                                disabled={previewGenerating}
                                startIcon={<FiDownload />}
                                sx={{ 
                                    minWidth: 160, 
                                    borderRadius: '8px', 
                                    background: 'linear-gradient(195deg, #FB923C, #EA580C)', 
                                    fontWeight: 700 
                                }}
                                size="large"
                            >
                                Export & Save PDF
                            </Button>
                        ) : !generating ? (
                            <Button 
                                onClick={handlePreviewReport} 
                                variant="contained" 
                                color="primary" 
                                disabled={!newReport.name || checkDuplicateName(newReport.name) || Boolean(dateError)}
                                startIcon={<FiEye />}
                                sx={{ 
                                    minWidth: 160, 
                                    borderRadius: '8px', 
                                    background: 'linear-gradient(195deg, #FB923C, #EA580C)', 
                                    fontWeight: 700 
                                }}
                                size="large"
                            >
                                Preview Report
                            </Button>
                        ) : (
                            <Box />
                        )}
                    </DialogActions>
                </Dialog>
            </Box>

            {/* 3. Modal: Report Details & Notes Modal */}
            <Dialog 
                open={detailsModalOpen} 
                onClose={() => setDetailsModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b', pb: 1 }}>
                    Document Details & Notes
                </DialogTitle>
                <DialogContent>
                    {selectedReportDetails && (
                        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                            <Box p={2} bgcolor="#f8fafc" borderRadius="10px" border="1px solid #e2e8f0">
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Box p={1} bgcolor="rgba(234, 88, 12, 0.1)" borderRadius="8px">
                                            <FiFileText color="#ea580c" size={22} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={800} color="#1e293b">
                                                {selectedReportDetails.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {selectedReportDetails.id}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip 
                                        label={isExternalReport(selectedReportDetails) ? "External Upload" : "System Generated"}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: isExternalReport(selectedReportDetails) ? '#f1f5f9' : 'rgba(234, 88, 12, 0.1)',
                                            color: isExternalReport(selectedReportDetails) ? '#475569' : '#ea580c'
                                        }}
                                    />
                                </Box>

                                <Grid container spacing={2} pt={1} borderTop="1px dashed #e2e8f0">
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            CATEGORY
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#334155">
                                            {selectedReportDetails.type}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            DATE
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#334155">
                                            {selectedReportDetails.date || selectedReportDetails.createdAt?.split('T')[0] || "Recent"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            FILE SIZE
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#334155">
                                            {selectedReportDetails.size || "1.2 MB"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            FORMAT
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#334155">
                                            PDF Document
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Notes / Description Section */}
                            <Box>
                                <Typography variant="caption" fontWeight={800} color="#475569" textTransform="uppercase" display="block" mb={1}>
                                    NOTES & REMARKS
                                </Typography>
                                <Box p={2} bgcolor="rgba(234, 88, 12, 0.04)" borderRadius="10px" border="1px solid rgba(234, 88, 12, 0.15)">
                                    <Typography variant="body2" color="#334155" sx={{ fontStyle: selectedReportDetails.description ? 'normal' : 'italic', lineHeight: 1.6 }}>
                                        {selectedReportDetails.description 
                                            ? selectedReportDetails.description 
                                            : "No custom notes were provided for this document."}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
                    <Button onClick={() => setDetailsModalOpen(false)} color="inherit">
                        Close
                    </Button>
                    {selectedReportDetails && (
                        <Box display="flex" gap={1}>
                            <Button 
                                onClick={() => {
                                    setDetailsModalOpen(false);
                                    handleViewReport(selectedReportDetails);
                                }}
                                variant="outlined"
                                startIcon={<FiEye />}
                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                            >
                                View PDF
                            </Button>
                        </Box>
                    )}
                </DialogActions>
            </Dialog>

            {/* 4. Modal: Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this report from the archive? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        onClick={async () => {
                            if (!reportToDelete) return;
                            try {
                                setDeleteDialogOpen(false);
                                await deleteReport(reportToDelete);
                                showSnackbar("Report deleted successfully", "success");
                                fetchReports();
                            } catch (error) {
                                showSnackbar("Failed to delete report", "error");
                            } finally {
                                setReportToDelete(null);
                            }
                        }} 
                        color="error" 
                        variant="contained"
                        sx={{ borderRadius: '8px' }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
