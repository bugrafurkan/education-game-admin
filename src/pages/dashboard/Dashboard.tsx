// src/pages/dashboard/Dashboard.tsx
import {
    Box, Grid, Paper, Typography, Card, CardContent,
    CardHeader, Divider, Button, List, ListItem,
    ListItemText, CircularProgress, Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
    QuestionAnswer as QuestionIcon,
    Games as GameIcon,
    School as SchoolIcon,
    Add as AddIcon,
    ViewList as ViewListIcon,
    Gamepad as GamepadIcon,
    CloudDownload as CloudDownloadIcon,
    Campaign as CampaignIcon,
    LibraryBooks as LibraryBooksIcon
} from '@mui/icons-material';
import { useDashboard } from '../../hooks/useDashboard';

const Dashboard = () => {
    const { stats, loading, error } = useDashboard();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    // eğer stats null ise varsayılan değerlerle gösterelim
    const dashboardStats = stats || {
        questionCount: 0,
        gameCount: 0,
        categoryCount: 0,
        exportCount: 0,
        advertisementCount: 0,
        questionGroupCount: 0,
        recentQuestions: [],
        recentGames: []
    };

    const statItems = [
        {
            title: 'Toplam Soru',
            value: dashboardStats.questionCount,
            icon: <QuestionIcon sx={{ fontSize: 40 }} color="primary" />
        },
        {
            title: 'Oyun Sayısı',
            value: dashboardStats.gameCount,
            icon: <GameIcon sx={{ fontSize: 40 }} color="success" />
        },
        {
            title: 'Kategoriler',
            value: dashboardStats.categoryCount,
            icon: <SchoolIcon sx={{ fontSize: 40 }} color="warning" />
        },
        {
            title: 'Soru Grupları',
            value: dashboardStats.questionGroupCount || 0, // Soru grupları sayısı
            icon: <LibraryBooksIcon sx={{ fontSize: 40 }} color="secondary" /> // Mor renk kullanıyoruz
        },
        {
            title: 'Reklamlar',
            value: dashboardStats.advertisementCount || 0, // Reklam sayısı istatistiği
            icon: <CampaignIcon sx={{ fontSize: 40 }} color="info" /> // Reklam ikonu
        },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {statItems.map((stat, index) => (
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
                            {dashboardStats.recentQuestions.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Henüz soru eklenmemiş.
                                </Typography>
                            ) : (
                                <List>
                                    {dashboardStats.recentQuestions.map((question) => (
                                        <ListItem
                                            key={question.id}
                                            component={Link}
                                            to={`/questions/${question.id}`}
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                '&:hover': { bgcolor: '#f5f5f5' }
                                            }}
                                        >
                                            <ListItemText
                                                primary={question.question_text}
                                                secondary={`Eklenme: ${new Date(question.created_at).toLocaleDateString()}`}
                                                primaryTypographyProps={{
                                                    noWrap: true,
                                                    style: { maxWidth: '100%' }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, height: '100%' }}>
                        <CardHeader title="Son Oyunlar" />
                        <Divider />
                        <CardContent>
                            {dashboardStats.recentGames.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Henüz oyun eklenmemiş.
                                </Typography>
                            ) : (
                                <List>
                                    {dashboardStats.recentGames.map((game) => (
                                        <ListItem
                                            key={game.id}
                                            component={Link}
                                            to={`/games/${game.id}`}
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                '&:hover': { bgcolor: '#f5f5f5' }
                                            }}
                                        >
                                            <ListItemText
                                                primary={game.name}
                                                secondary={`Tip: ${game.type === 'jeopardy' ? 'Jeopardy' : 'Bilgi Çarkı'}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
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
                                <Grid item xs={12} sm={6} md={2.4}>
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
                                <Grid item xs={12} sm={6} md={2.4}>
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
                                <Grid item xs={12} sm={6} md={2}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<LibraryBooksIcon />}
                                        component={Link}
                                        to="/question-groups"
                                        sx={{ py: 1.5 }}
                                    >
                                        Soru Grupları
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
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
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<CampaignIcon />}
                                        component={Link}
                                        to="/advertisements"
                                        sx={{ py: 1.5 }}
                                    >
                                        Reklamları Yönet
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<CloudDownloadIcon />}
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