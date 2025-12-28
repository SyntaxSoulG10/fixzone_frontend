"use client";

import {
    Grid,
    Card,
    Box,
    Typography,
    Button,
    IconButton,
    Divider
} from "@mui/material";
import { FiMoreVertical, FiMapPin, FiPhone, FiPlus } from "react-icons/fi";
import Link from 'next/link';

const MY_CENTERS = [
    { id: 1, name: "Downtown Branch", location: "123 Main St, New York, NY", phone: "+1 (555) 123-4567", revenue: "$45,200", status: "Active" },
    { id: 2, name: "Westside Hub", location: "456 West Ave, New York, NY", phone: "+1 (555) 987-6543", revenue: "$32,100", status: "Active" },
];

export default function MyCentersPage() {
    return (
        <Box pb={3}>
            {/* Header */}
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3} mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                        My Service Centers
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your branches and locations.
                    </Typography>
                </Box>
                <Button variant="contained" color="primary" sx={{ color: '#ffffff' }}>
                    <FiPlus style={{ marginRight: 8 }} /> New Branch
                </Button>
            </Box>

            <Grid container spacing={3}>
                {MY_CENTERS.map((center) => (
                    <Grid key={center.id} size={{ xs: 12, md: 6, lg: 4 }}>
                        <Card sx={{ height: '100%', p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box
                                    width={48}
                                    height={48}
                                    borderRadius="0.5rem"
                                    bgcolor="primary.main"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    color="#ffffff"
                                    fontSize="1.25rem"
                                    fontWeight="bold"
                                    boxShadow={3}
                                >
                                    {center.name.charAt(0)}
                                </Box>
                                <Box
                                    px={1}
                                    py={0.5}
                                    bgcolor="success.main"
                                    color="#ffffff"
                                    borderRadius="0.25rem"
                                    fontSize="0.75rem"
                                    fontWeight="bold"
                                    sx={{ opacity: 0.9, boxShadow: 1 }}
                                >
                                    {center.status}
                                </Box>
                            </Box>

                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {center.name}
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={1} mb={3}>
                                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                    <FiMapPin />
                                    <Typography variant="body2">{center.location}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                    <FiPhone />
                                    <Typography variant="body2">{center.phone}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box display="flex" alignItems="center" justifyContent="space-between" pt={1}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                        Revenue (Dec)
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {center.revenue}
                                    </Typography>
                                </Box>
                                <Button variant="text" color="primary">Manage</Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

