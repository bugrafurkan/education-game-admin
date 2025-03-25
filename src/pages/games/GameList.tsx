// src/pages/games/GameList.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Grid, Card, CardMedia,
    CardContent, CardActions, IconButton, Chip, Tooltip, TextField,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    PlayArrow as PlayIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Oyun tipi
interface Game {
    id: number;
    name: string;
    type: 'jeopardy' | 'wheel';
    description: string;
    questionCount: number;
    is_active: boolean;
    image?: string;
}

// Mock veri
const mockGames: Game[] = [
    {
        id: 1,
        name: 'Tarih Bilgi Yarışması',
        type: 'jeopardy',
        description: 'Osmanlı İmparatorluğu ve Türkiye Cumhuriyeti hakkında sorular',
        questionCount: 25,
        is_active: true,
        image: 'https://via.placeholder.com/300x180?text=Tarih+Bilgi+Yarışması'
    },
    {
        id: 2,
        name: 'Fen Soruları',
        type: 'jeopardy',
        description: 'Fizik, kimya ve biyoloji konularında interaktif sorular',
        questionCount: 30,
        is_active: true,
        image: 'https://via.placeholder.com/300x180?text=Fen+Soruları'
    },
    {
        id: 3,
        name: 'Matematik Çarkı',
        type: 'wheel',
        description: 'Matematik problemleri içeren çarkıfelek oyunu',
        questionCount: 20,
        is_active: true,
        image: 'https://via.placeholder.com/300x180?text=Matematik+Çarkı'
    },
    {
        id: 4,
        name: 'Genel Kültür',
        type: 'jeopardy',
        description: 'Çeşitli konularda genel kültür soruları',
        questionCount: 40,
        is_active: false,
        image: 'https://via.placeholder.com/300x180?text=Genel+Kültür'
    }
];

const GameList = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Backend API bağlantısı yerine mock veri
        setLoading(true);

        setTimeout(() => {
            setGames(mockGames);
            setLoading(false);
        }, 500);
    }, []);

    // Arama filtrelemesi
    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(search.toLowerCase()) ||
        game.description.toLowerCase().includes(search.toLowerCase())
    );

    // Oyun tipini Türkçe olarak gösterme
    const getGameTypeLabel = (type: string) => {
        switch (type) {
            case 'jeopardy':
                return 'Jeopardy (Bilgi Yarışması)';
            case 'wheel':
                return 'Çarkıfelek';
            default:
                return type;
        }
    };

    // Oyun durumunu gösterme
    const getStatusChip = (isActive: boolean) => {
        return isActive
            ? <Chip label="Aktif" color="success" size="small" />
            : <Chip label="Pasif" color="error" size="small" />;
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Oyun Yönetimi
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Oyun Ara"
                            variant="outlined"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/games/add"
                            sx={{
                                py: 1.5,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                        >
                            Yeni Oyun Ekle
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography>Yükleniyor...</Typography>
                </Box>
            ) : filteredGames.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography>Oyun bulunamadı.</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredGames.map((game) => (
                        <Grid item xs={12} sm={6} md={4} key={game.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 2,
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    height="180"
                                    image={game.image || 'https://via.placeholder.com/300x180?text=No+Image'}
                                    alt={game.name}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6" component="div">
                                            {game.name}
                                        </Typography>
                                        {getStatusChip(game.is_active)}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {getGameTypeLabel(game.type)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {game.description}
                                    </Typography>
                                    <Typography variant="body2" color="primary">
                                        {game.questionCount} Soru
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                                    <Box>
                                        <Tooltip title="Düzenle">
                                            <IconButton color="info">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Sil">
                                            <IconButton color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Button
                                        component={Link}
                                        to={`/games/${game.id}`}
                                        variant="outlined"
                                        size="small"
                                        endIcon={<PlayIcon />}
                                    >
                                        Detaylar
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default GameList;