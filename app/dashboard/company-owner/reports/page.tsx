"use client";

import {
    Box,
    Typography,
    Card,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider
} from "@mui/material";
import { FiDownload, FiFileText } from "react-icons/fi";

/**
 * Interface defining the report structure.
 * Ensures predictable rendering in the list view.
 * Each report has a unique id, display name, creation date, category, and file size.
 */
interface ReportItem {
    id: number; // Unique identifier for the report
    name: string; // Display name of the report
    date: string; // Date when report was generated
    type: string; // Report category (Financial, Analytics, Audit, etc)
    size: string; // File size for download indication
}

/**
 * Static dataset defined outside the component.
 * Keeps the render function focused on layout logic.
 * In production, this would be fetched from an API endpoint.
 */
const DUMMY_REPORTS: ReportItem[] = [
    { id: 1, name: "January 2026 Revenue Report", date: "Feb 01, 2026", type: "Financial", size: "1.2 MB" },
    { id: 2, name: "Q4 2025 Performance Summary", date: "Jan 15, 2026", type: "Analytics", size: "4.5 MB" },
    { id: 3, name: "Colombo Branch Audit Report", date: "Jan 10, 2026", type: "Audit", size: "2.1 MB" },
    { id: 4, name: "Customer Satisfaction Survey (Jan)", date: "Feb 05, 2026", type: "Feedback", size: "850 KB" },
    { id: 5, name: "Staff Attendance Report", date: "Feb 01, 2026", type: "HR", size: "500 KB" },
];

/**
 * Component representing a single row in the report list.
 * Displays report metadata and provides download action.
 */
function ReportRow({ report, isLast }: { report: ReportItem, isLast: boolean }) {
    return (
        <>
            <ListItem alignItems="center" sx={{ py: 3, px: 3 }}>
                {/* Icon avatar indicating file type */}
                <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', color: '#ffffff', borderRadius: 2, boxShadow: 1 }}>
                        <FiFileText size={20} />
                    </Avatar>
                </ListItemAvatar>
                
                {/* Report details: name on primary line, metadata on secondary */}
                <ListItemText
                    primary={<Typography variant="h6" fontWeight="medium">{report.name}</Typography>}
                    secondary={
                        <Typography component="span" variant="body2" color="text.secondary">
                            {report.date} • {report.type} • {report.size}
                        </Typography>
                    }
                />
                
                {/* Download button: triggers file download action */}
                <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="download" color="primary">
                        <FiDownload />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
            {/* Divider between list items (except after last item) */}
            {!isLast && <Divider component="li" />}
        </>
    );
}

/**
 * Orchestrates the layout for the reports list display.
 * Renders page header and a scrollable list of all available reports.
 */
export default function ReportsPage() {
    return (
        <Box pb={3}>
            {/* Page header with title and description */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Reports Archive
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Access and download historical financial and operational performance data.
                </Typography>
            </Box>

            {/* Report list container */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                    {/* Map over all reports and render each as a list row */}
                    {DUMMY_REPORTS.map((report, index) => (
                        <ReportRow 
                            key={report.id} 
                            report={report} 
                            isLast={index === DUMMY_REPORTS.length - 1} 
                        />
                    ))}
                </List>
            </Card>
        </Box>
    );
}
