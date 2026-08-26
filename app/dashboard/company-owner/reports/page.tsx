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
    OutlinedInput
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { FiDownload, FiFileText, FiSearch, FiFilter, FiCheckCircle, FiEye, FiTrash2, FiUpload } from "react-icons/fi";
import { getAllReports, createReport, deleteReport, ReportItem } from "@/services/reportService";
import FeedbackSnackbar, { SeverityType } from "@/components/UI/FeedbackSnackbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { useDashboardData } from "@/context/DashboardDataContext";

const availableSections = ["Executive Summary", "Key Metrics", "Detailed Data Table", "Chart Visualizations", "Raw Data Export"];

const base64ToBlob = (base64Str: string, contentType: string = 'application/pdf') => {
    // Remove data URL prefix if present
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

    const [openDialog, setOpenDialog] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<string | null>(null);
    
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
    
    const getDefaultReportName = (type: string) => `${type} Report - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;

    const [newReport, setNewReport] = useState<{
        name: string;
        type: string;
        startDate: Date | null;
        endDate: Date | null;
        branch: string;
        sections: string[];
    }>({
        name: getDefaultReportName("Financial"),
        type: "Financial",
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date(),
        branch: "All Branches",
        sections: ["Executive Summary", "Key Metrics", "Detailed Data Table", "Chart Visualizations"]
    });

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
        "Capturing visualizations...",
        "Gathering data from sources...",
        "Applying analytical models...",
        "Formatting document layout...",
        "Finalizing and saving report..."
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getAllReports();
            // Sort so newest reports (like recent uploads) show at the very top of page 1
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Fallback to extension check if mime type is missing on Windows
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            showSnackbar("Please upload a valid PDF file.", "warning");
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            
            try {
                showSnackbar("Uploading document...", "info");
                await createReport({
                    name: file.name.replace(/\.pdf$/i, ''),
                    type: 'External',
                    fileContentBase64: base64,
                    size: (file.size / 1024 / 1024).toFixed(2) + " MB"
                } as any);
                
                showSnackbar("Document uploaded successfully!", "success");
                fetchReports();
            } catch(err: any) {
                console.error(err);
                const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Upload failed";
                showSnackbar(`Upload failed: ${backendMsg}`, "error");
            }
        };
        reader.readAsDataURL(file);
        
        event.target.value = '';
    };

    const handleViewReport = async (row: ReportItem) => {
        console.log("Viewing report row:", row);
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
        } else if (row.type === 'External') {
            showSnackbar("PDF content is missing or corrupted in the database.", "error");
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
                    summaryText: `Archived ${row.type.toLowerCase()} report summary for ${ownerData?.companyName || 'FixZone Automotive'}.`
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
        if (!newReport.name) return;

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

        const summaryText = `This report provides a comprehensive overview of ${newReport.type.toLowerCase()} operations for ${newReport.branch || 'all branches'} within the selected timeframe for ${ownerData?.companyName || 'FixZone Automotive'}. All metrics reflect real-time business activity and verified customer transactions. Ensure all confidential information is handled appropriately according to FixZone policies.`;

        setReportData({ kpi1, kpi2, kpi3, chartLabels, chartDataValues, tableData, summaryText });
    };

    useEffect(() => {
        if (previewGenerating && reportData && chartRef.current) {
            // Wait a brief moment for the hidden Chart.js canvas to finish rendering
            const timer = setTimeout(() => {
                try {
                    const chartImage = chartRef.current?.canvas?.toDataURL('image/png');
                    const doc = generatePDFDoc(newReport, chartImage, reportData);
                    pdfDocRef.current = doc;
                    
                    // Generate Blob URL to load in iframe
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
        
        // Add Professional Header
        doc.setFillColor(248, 249, 250);
        doc.rect(0, 0, 210, 40, "F");
        
        doc.setFontSize(24);
        doc.setTextColor(33, 37, 41);
        doc.setFont("helvetica", "bold");
        doc.text(ownerData?.companyName || "FixZone Automotive", 14, 25);
        
        doc.setFontSize(14);
        doc.setTextColor(108, 117, 125);
        doc.setFont("helvetica", "normal");
        doc.text("Official Business Report", 14, 33);

        let currentY = 50;

        // Report Metadata
        doc.setFontSize(14);
        doc.setTextColor(33, 37, 41);
        doc.setFont("helvetica", "bold");
        doc.text("Report Details", 14, currentY);
        currentY += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(73, 80, 87);
        doc.text(`Name: ${report.name}`, 14, currentY); currentY += 6;
        doc.text(`Category: ${report.type}`, 14, currentY); currentY += 6;
        
        const startStr = report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A';
        const endStr = report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A';
        doc.text(`Date Range: ${startStr} - ${endStr}`, 14, currentY); currentY += 6;
        
        doc.text(`Branch: ${report.branch || 'All Branches'}`, 14, currentY); currentY += 12;

        // Executive Summary
        if (report.sections?.includes("Executive Summary") || !report.sections) {
            doc.setFontSize(14);
            doc.setTextColor(33, 37, 41);
            doc.setFont("helvetica", "bold");
            doc.text("Executive Summary", 14, currentY);
            currentY += 8;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(73, 80, 87);
            const splitText = doc.splitTextToSize(data.summaryText, 180);
            doc.text(splitText, 14, currentY);
            currentY += (splitText.length * 5) + 8;
        }

        // Key Metrics
        if (report.sections?.includes("Key Metrics") || !report.sections) {
            doc.setFontSize(14);
            doc.setTextColor(33, 37, 41);
            doc.setFont("helvetica", "bold");
            doc.text("Key Metrics", 14, currentY);
            currentY += 8;

            // Draw KPI boxes
            doc.setFillColor(255, 247, 237);
            doc.rect(14, currentY, 55, 20, "F");
            doc.rect(75, currentY, 55, 20, "F");
            doc.rect(136, currentY, 55, 20, "F");

            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(report.type === 'Financial' ? "Total Revenue" : "Total Volume", 18, currentY + 7);
            doc.text("Growth (MoM)", 79, currentY + 7);
            doc.text("Active Status", 140, currentY + 7);

            doc.setFontSize(12);
            doc.setTextColor(30, 30, 30);
            doc.setFont("helvetica", "bold");
            doc.text(data.kpi1, 18, currentY + 15);
            doc.text(data.kpi2, 79, currentY + 15);
            doc.text(data.kpi3, 140, currentY + 15);

            currentY += 28;
        }

        // Chart Visualizations
        if (report.sections?.includes("Chart Visualizations") || !report.sections) {
            if (chartImage) {
                // Check if page break is needed before chart
                if (currentY > 180) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFontSize(14);
                doc.setTextColor(33, 37, 41);
                doc.setFont("helvetica", "bold");
                doc.text("Performance Chart", 14, currentY);
                currentY += 8;

                // Insert the base64 image
                doc.addImage(chartImage, 'PNG', 14, currentY, 182, 80);
                currentY += 90;
            }
        }

        // Data Table
        if (report.sections?.includes("Detailed Data Table") || !report.sections) {
            if (currentY > 220) {
                doc.addPage();
                currentY = 20;
            }

            autoTable(doc, {
                startY: currentY,
                head: [['ID', 'Description', 'Value/Metric', 'Status']],
                body: data.tableData,
                theme: 'striped',
                headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 5, textColor: [50, 50, 50] },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { top: 10, left: 14, right: 14 }
            });
        }

        // Footer with Page Numbers
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount} - FixZone Confidential`,
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

            // Simulate multi-step generation process for professional UX
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

            // Actual API call to backend
            await createReport({
                name: newReport.name,
                type: newReport.type,
            });
            
            // The PDF has already been generated and is stored in pdfDocRef!
            if (pdfDocRef.current) {
                const filename = `${newReport.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
                pdfDocRef.current.save(filename);
            }
            
            showSnackbar("Report generated and downloaded successfully!", "success");
            
            // Clean up
            setOpenDialog(false);
            setPreviewMode(false);
            setPdfPreviewUrl(null);
            pdfDocRef.current = null;
            
            // Reset form
            setNewReport({
                name: getDefaultReportName("Financial"),
                type: "Financial",
                startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                endDate: new Date(),
                branch: "All Branches",
                sections: ["Executive Summary", "Key Metrics", "Detailed Data Table", "Chart Visualizations"]
            });
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

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === "All" || report.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [reports, searchQuery, typeFilter]);

    const reportTypes = ["All", ...Array.from(new Set(reports.map(r => r.type)))];

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Report Name",
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={1.5} height="100%">
                    <Box 
                        sx={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: 1.5, 
                            bgcolor: 'primary.50', 
                            color: 'primary.main',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}
                    >
                        <FiFileText size={18} />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: "date",
            headerName: "Date Generated",
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: "type",
            headerName: "Category",
            width: 150,
            renderCell: (params: GridRenderCellParams) => {
                let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
                switch(params.value) {
                    case 'Financial': color = 'success'; break;
                    case 'Analytics': color = 'info'; break;
                    case 'Audit': color = 'warning'; break;
                    case 'Feedback': color = 'secondary'; break;
                    default: color = 'primary';
                }
                return (
                    <Box display="flex" alignItems="center" height="100%">
                        <Chip label={params.value} size="small" color={color} variant="outlined" sx={{ fontWeight: 'medium' }} />
                    </Box>
                );
            }
        },
        {
            field: "size",
            headerName: "File Size",
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: "actions",
            headerName: "Action",
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={1} height="100%">
                    <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleViewReport(params.row)}
                        title="View Report"
                    >
                        <FiEye />
                    </IconButton>
                    <IconButton 
                        color="primary" 
                        size="small"
                        title="Download Report"
                        onClick={async () => {
                            if (params.row.fileContentBase64) {
                                // Download uploaded file directly
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
                            
                            if (params.row.type === 'External') {
                                showSnackbar("PDF content is missing or corrupted in the database.", "error");
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
                                summaryText: `Archived ${params.row.type.toLowerCase()} report summary for ${ownerData?.companyName || 'FixZone Automotive'}.`
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
                        <FiDownload />
                    </IconButton>
                    <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => {
                            setReportToDelete(params.row.id);
                            setDeleteDialogOpen(true);
                        }}
                    >
                        <FiTrash2 />
                    </IconButton>
                </Box>
            )
        }
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false as const, // Important: disable animation so it renders instantly off-screen
        plugins: {
            legend: { position: 'top' as const },
            title: { display: false },
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box pb={3}>
                <FeedbackSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                />
                <Box mb={4} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                            Reports Center
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Access, filter, and download all your historical and generated reports.
                        </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                        />
                        <Button 
                            variant="outlined" 
                            startIcon={<FiUpload />}
                            sx={{ 
                                borderRadius: '0.75rem', 
                                px: 3, 
                                py: 1.2, 
                                bgcolor: '#fff', 
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload PDF
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<FiFileText />}
                            sx={{ 
                                borderRadius: '0.75rem', 
                                px: 3.5, 
                                py: 1.2,
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
                                setOpenDialog(true);
                            }}
                        >
                            Generate New Report
                        </Button>
                    </Box>
                </Box>

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

                <Card sx={{ p: 2.5, mb: 3, borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                        <TextField
                            placeholder="Search reports..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ minWidth: { xs: '100%', md: 320 }, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
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
                        
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Box display="flex" alignItems="center" gap={0.5} mr={1} color="text.secondary">
                                <FiFilter size={16} />
                                <Typography variant="body2" fontWeight={600}>Filter:</Typography>
                            </Box>
                            {reportTypes.map((type) => (
                                <Chip 
                                    key={type} 
                                    label={type} 
                                    onClick={() => setTypeFilter(type)}
                                    color={typeFilter === type ? "primary" : "default"}
                                    variant={typeFilter === type ? "filled" : "outlined"}
                                    sx={{ borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                                />
                            ))}
                        </Box>
                    </Stack>
                </Card>

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
                                '& .MuiDataGrid-cell:focus': {
                                    outline: 'none',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase'
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f1f5f9'
                                }
                            }}
                        />
                    )}
                </Card>

                <Dialog 
                    open={openDialog} 
                    onClose={() => !generating && setOpenDialog(false)} 
                    maxWidth={previewMode ? "lg" : "md"}
                    fullWidth 
                    PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', transition: 'max-width 0.3s ease' } }}
                    transitionDuration={400}
                >
                    <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem', bgcolor: previewMode ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                        {generating ? "Exporting Document" : previewMode ? "Native PDF Preview" : "Generate Custom Report"}
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
                                    <Typography mt={2} color="text.secondary" fontWeight="medium">Rendering Native PDF Preview...</Typography>
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
                                <TextField
                                    label="Report Title"
                                    fullWidth
                                    variant="outlined"
                                    value={newReport.name}
                                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                                    disabled={generating}
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
                                                    name: prev.name === getDefaultReportName(prev.type) ? getDefaultReportName(type) : prev.name
                                                }));
                                            }}
                                            disabled={generating}
                                        >
                                            <MenuItem value="Financial">Financial</MenuItem>
                                            <MenuItem value="Analytics">Analytics</MenuItem>
                                            <MenuItem value="Audit">Audit</MenuItem>
                                            <MenuItem value="Feedback">Feedback</MenuItem>
                                            <MenuItem value="Operational">Operational</MenuItem>
                                            <MenuItem value="HR">HR</MenuItem>
                                            <MenuItem value="Executive">Executive</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth>
                                        <InputLabel>Target Branch/Region</InputLabel>
                                        <Select
                                            value={newReport.branch}
                                            label="Target Branch/Region"
                                            onChange={(e) => setNewReport({ ...newReport, branch: e.target.value })}
                                            disabled={generating}
                                        >
                                            {branchOptions.map((b) => (
                                                <MenuItem key={b} value={b}>{b}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>

                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                    <DatePicker
                                        label="Start Date"
                                        value={newReport.startDate}
                                        onChange={(newValue) => setNewReport({ ...newReport, startDate: newValue })}
                                        sx={{ width: '100%' }}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        value={newReport.endDate}
                                        onChange={(newValue) => setNewReport({ ...newReport, endDate: newValue })}
                                        sx={{ width: '100%' }}
                                    />
                                </Stack>

                                <FormControl fullWidth>
                                    <InputLabel>Include Sections</InputLabel>
                                    <Select
                                        multiple
                                        value={newReport.sections}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setNewReport({ ...newReport, sections: typeof value === 'string' ? value.split(',') : value });
                                        }}
                                        input={<OutlinedInput label="Include Sections" />}
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
                                </FormControl>
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
                                color={previewMode ? "inherit" : "inherit"} 
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
                                sx={{ minWidth: 160, transition: 'all 0.3s ease' }}
                                size="large"
                            >
                                Export to PDF
                            </Button>
                        ) : !generating ? (
                            <Button 
                                onClick={handlePreviewReport} 
                                variant="contained" 
                                color="primary" 
                                disabled={!newReport.name}
                                startIcon={<FiEye />}
                                sx={{ minWidth: 160, transition: 'all 0.3s ease' }}
                                size="large"
                            >
                                Preview Report
                            </Button>
                        ) : (
                            <Box /> // Spacer for generating state
                        )}
                    </DialogActions>
                </Dialog>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this report? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
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
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
