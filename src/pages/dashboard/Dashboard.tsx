// src/pages/dashboard/Dashboard.tsx
import {
    Box, Grid, Paper, Typography, Card, CardContent,
    CardHeader, Divider, Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
    QuestionAnswer as QuestionIcon,
    Games as GameIcon,
    School as SchoolIcon,
    PlayArrow as PlayIcon,
    Add as AddIcon,
    ViewList as ViewListIcon,
    Gamepad as GamepadIcon,
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

const Dashboard = () => {
    const stats = [
        { title: 'Toplam Soru', value: 256, icon: <QuestionIcon sx={{ fontSize: 40 }} color="primary" /> },
        { title: 'Oyun Sayısı', value: 12, icon: <GameIcon sx={{ fontSize: 40 }} color="success" /> },
        { title: 'Kategoriler', value: 18, icon: <SchoolIcon sx={{ fontSize: 40 }} color="warning" /> },
        { title: 'Exports', value: 34, icon: <PlayIcon sx={{ fontSize: 40 }} color="error" /> },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid #eee',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Box>
                                {stat.icon}
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.title}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, height: '100%' }}>
                        <CardHeader title="Son Eklenen Sorular" />
                        <Divider />
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Henüz soru eklenmemiş.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, height: '100%' }}>
                        <CardHeader title="Son Oyunlar" />
                        <Divider />
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Henüz oyun eklenmemiş.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2 }}>
                        <CardHeader title="Hızlı İşlemler" />
                        <Divider />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<AddIcon />}
                                        component={Link}
                                        to="/questions/add"
                                        sx={{ py: 1.5 }}
                                    >
                                        Yeni Soru Ekle
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<ViewListIcon />}
                                        component={Link}
                                        to="/questions"
                                        sx={{ py: 1.5 }}
                                    >
                                        Soruları Listele
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<GamepadIcon />}
                                        component={Link}
                                        to="/games"
                                        sx={{ py: 1.5 }}
                                    >
                                        Oyunları Görüntüle
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<CloudUploadIcon />}
                                        component={Link}
                                        to="/exports"
                                        sx={{ py: 1.5 }}
                                    >
                                        Export İşlemleri
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;