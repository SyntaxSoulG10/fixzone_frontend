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
 */
interface ReportItem {
    id: number;
    name: string;
    date: string;
    type: string;
    size: string;
}

/**
 * Static dataset defined outside the component.
 * Keeps the render function focused on layout logic.
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
 */
function ReportRow({ report, isLast }: { report: ReportItem, isLast: boolean }) {
    return (
        <>
            <ListItem alignItems="center" sx={{ py: 3, px: 3 }}>
                <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', color: '#ffffff', borderRadius: 2, boxShadow: 1 }}>
                        <FiFileText size={20} />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={<Typography variant="h6" fontWeight="medium">{report.name}</Typography>}
                    secondary={
                        <Typography component="span" variant="body2" color="text.secondary">
                            {report.date} • {report.type} • {report.size}
                        </Typography>
                    }
                />
                <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="download" color="primary">
                        <FiDownload />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
            {!isLast && <Divider component="li" />}
        </>
    );
}

/**
 * Orchestrates the layout for the reports list display.
 */
export default function ReportsPage() {
    return (
        <Box pb={3}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Reports Archive
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Access and download historical financial and operational performance data.
                </Typography>
            </Box>

            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
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
