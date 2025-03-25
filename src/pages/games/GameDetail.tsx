// src/pages/games/GameDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, Grid, Chip,
    List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
    IconButton, Tabs, Tab, Alert
} from '@mui/material';
import {
    QuestionAnswer as QuestionIcon,
    Settings as SettingsIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ArrowBack as BackIcon,
    CloudDownload as ExportIcon,
    Share as ShareIcon
} from '@mui/icons-material';

// Geçici oyun tipi
interface Game {
    id: number;
    name: string;
    type: 'jeopardy' | 'wheel';
    description: string;
    questionCount: number;
    created_by: string;
    is_active: boolean;
    questions: Question[];
    config: any;
}

// Geçici soru tipi
interface Question {
    id: number;
    question_text: string;
    question_type: string;
    points: number;
}

// Mock veri
const mockGame: Game = {
    id: 1,
    name: 'Tarih Bilgi Yarışması',
    type: 'jeopardy',
    description: 'Osmanlı ve Cumhuriyet tarihiyle ilgili sorular içeren bir yarışma oyunu.',
    questionCount: 3,
    created_by: 'Admin',
    is_active: true,
    questions: [
        {
            id: 1,
            question_text: 'İstanbul hangi yılda fethedilmiştir?',
            question_type: 'multiple_choice',
            points: 100
        },
        {
            id: 2,
            question_text: 'Türkiye Cumhuriyeti hangi yılda kurulmuştur?',
            question_type: 'multiple_choice',
            points: 200
        },
        {
            id: 3,
            question_text: 'Osmanlı İmparatorluğu\'nun kurucusu kimdir?',
            question_type: 'qa',
            points: 300
        }
    ],
    config: {
        time_mode: 'countdown',
        surprise_enabled: true,
        point_multiplier: 1
    }
};

// Sekme değerleri için interface
interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
}

// Sekme paneli bileşeni
const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`game-tabpanel-${index}`}
            aria-labelledby={`game-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const GameDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        // Backend API bağlantısı yerine mock veri kullanıyoruz
        setLoading(true);

        setTimeout(() => {
            // Gerçek uygulamada burada id'ye göre bir API çağrısı yapılır
            setGame(mockGame);
            setLoading(false);
        }, 500);
    }, [id]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Oyun tipini Türkçe olarak gösterme
    const getGameTypeLabel = (type: string) => {
        switch (type) {
            case 'jeopardy':
                return 'Jeopardy';
            case 'wheel':
                return 'Bilgi Çarkı';
            default:
                return type;
        }
    };

    // Soru tipini Türkçe olarak gösterme
    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'Çoktan Seçmeli';
            case 'true_false':
                return 'Doğru-Yanlış';
            case 'qa':
                return 'Klasik';
            default:
                return type;
        }
    };

    if (loading) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    Oyun Detayı
                </Typography>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    Yükleniyor...
                </Paper>
            </Box>
        );
    }

    if (!game) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    Oyun Detayı
                </Typography>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    Oyun bulunamadı.
                </Paper>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Button
                    component={Link}
                    to="/games"
                    startIcon={<BackIcon />}
                    sx={{ mr: 2 }}
                >
                    Geri
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    {game.name}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to={`/questions/add?gameId=${game.id}`}
                    sx={{
                        mr: 1,
                        bgcolor: '#1a1a27',
                        '&:hover': { bgcolor: '#2a2a37' }
                    }}
                >
                    Soru Ekle
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                >
                    Düzenle
                </Button>
            </Box>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Oyun Bilgileri
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Açıklama
                            </Typography>
                            <Typography variant="body1">
                                {game.description}
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Oyun Tipi
                                </Typography>
                                <Typography variant="body1">
                                    {getGameTypeLabel(game.type)}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Durum
                                </Typography>
                                <Chip
                                    label={game.is_active ? 'Aktif' : 'Pasif'}
                                    color={game.is_active ? 'success' : 'default'}
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Soru Sayısı
                                </Typography>
                                <Typography variant="body1">
                                    {game.questionCount}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Oluşturan
                                </Typography>
                                <Typography variant="body1">
                                    {game.created_by}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Paylaşım ve Export
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ShareIcon />}
                                sx={{ mb: 2 }}
                            >
                                iframe Kodu Al
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ExportIcon />}
                            >
                                WebGL Export
                            </Button>
                        </Box>

                        <Typography variant="h6" gutterBottom>
                            Hızlı İşlemler
                        </Typography>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            Oyunun ön izlemesini görmek için "Ön İzleme" butonuna tıklayabilirsiniz.
                        </Alert>

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mb: 2 }}
                        >
                            Oyun Ön İzleme
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="game tabs">
                        <Tab label="Sorular" id="game-tab-0" aria-controls="game-tabpanel-0" />
                        <Tab label="Ayarlar" id="game-tab-1" aria-controls="game-tabpanel-1" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">
                                Oyundaki Sorular
                            </Typography>

                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                component={Link}
                                to={`/questions/add?gameId=${game.id}`}
                                size="small"
                            >
                                Yeni Soru Ekle
                            </Button>
                        </Box>

                        <List>
                            {game.questions.length === 0 ? (
                                <Alert severity="warning">
                                    Bu oyuna henüz soru eklenmemiş.
                                </Alert>
                            ) : (
                                game.questions.map((question) => (
                                    <ListItem
                                        key={question.id}
                                        sx={{
                                            mb: 1,
                                            border: '1px solid #eee',
                                            borderRadius: 1,
                                            '&:hover': { bgcolor: '#f9f9f9' }
                                        }}
                                    >
                                        <ListItemIcon>
                                            <QuestionIcon />
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={question.question_text}
                                            secondary={
                                                <Box sx={{ display: 'flex', mt: 0.5 }}>
                                                    <Chip
                                                        label={getQuestionTypeLabel(question.question_type)}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Chip
                                                        label={`${question.points} Puan`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>
                                            }
                                        />

                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" aria-label="edit">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">
                                Oyun Ayarları
                            </Typography>

                            <Button
                                variant="outlined"
                                startIcon={<SettingsIcon />}
                                size="small"
                            >
                                Ayarları Düzenle
                            </Button>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Zaman Modu
                                    </Typography>
                                    <Typography variant="body1">
                                        {game.config.time_mode === 'countdown' ? 'Geri Sayım' : 'Sınırsız'}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Sürpriz Özellikler
                                    </Typography>
                                    <Typography variant="body1">
                                        {game.config.surprise_enabled ? 'Aktif' : 'Pasif'}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Puan Çarpanı
                                    </Typography>
                                    <Typography variant="body1">
                                        {game.config.point_multiplier}x
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
};

export default GameDetail;