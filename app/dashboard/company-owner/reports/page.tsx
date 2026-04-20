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

// Defining the shape of a report record clearly for maintainable access inside the list component
interface ReportItem {
    id: number;
    name: string;
    date: string;
    type: string;
    size: string;
}

// Static dataset for reports. In production, this would be swapped with a fetch from an internal reporting API endpoint.
const DUMMY_REPORTS: ReportItem[] = [
    { id: 1, name: "January 2026 Revenue Report", date: "Feb 01, 2026", type: "Financial", size: "1.2 MB" },
    { id: 2, name: "Q4 2025 Performance Summary", date: "Jan 15, 2026", type: "Analytics", size: "4.5 MB" },
    { id: 3, name: "Colombo Branch Audit Report", date: "Jan 10, 2026", type: "Audit", size: "2.1 MB" },
    { id: 4, name: "Customer Satisfaction Survey (Jan)", date: "Feb 05, 2026", type: "Feedback", size: "850 KB" },
    { id: 5, name: "Staff Attendance Report", date: "Feb 01, 2026", type: "HR", size: "500 KB" },
];

export default function ReportsPage() {
    return (
        <Box pb={3}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Reports
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Download financial and operational reports.
                </Typography>
            </Box>

            <Card>
                <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                    {DUMMY_REPORTS.map((report, index) => (
                        <Box key={report.id}>
                            <ListItem alignItems="center" sx={{ py: 3, px: 3 }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'primary.main', color: '#ffffff', borderRadius: 'lg', boxShadow: 2 }}>
                                        <FiFileText size={20} />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" fontWeight="medium">
                                            {report.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {report.date} • {report.type} • {report.size}
                                        </Typography>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="download">
                                        <FiDownload />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                            {index < DUMMY_REPORTS.length - 1 && <Divider component="li" />}
                        </Box>
                    ))}
                </List>
            </Card>
        </Box>
    );
}
