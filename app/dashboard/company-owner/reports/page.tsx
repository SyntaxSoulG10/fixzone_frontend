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

const DUMMY_REPORTS = [
    { id: 1, name: "December Revenue Report", date: "Dec 24, 2024", type: "Financial", size: "1.2 MB" },
    { id: 2, name: "Q4 Performance Summary", date: "Dec 20, 2024", type: "Analytics", size: "4.5 MB" },
    { id: 3, name: "Customer Satisfaction Survey", date: "Dec 15, 2024", type: "Feedback", size: "850 KB" },
    { id: 4, name: "Staff Attendance Report", date: "Dec 01, 2024", type: "HR", size: "500 KB" },
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
