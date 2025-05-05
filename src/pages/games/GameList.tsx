// src/pages/games/GameList.tsx
import { useState } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment,
    Grid, Card, CardContent, CardActions, CardMedia, Chip,
    TablePagination, CircularProgress, Alert, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle
} from '@mui/material';

import {
    Search as SearchIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';

import { Link } from 'react-router-dom';
import { useGames } from '../../hooks/useGames';

const GameList = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(6);
    const [search, setSearch] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<number | null>(null);

    // Hook ile oyunları yükle
    const { games, loading, error, pagination, deleteGame } = useGames(page);

    // Arama işlemi - client-side filtreleme
    const filteredGames = games.filter(game => {
        const searchLower = search.toLowerCase();
        return game.name.toLowerCase().includes(searchLower) ||
            (game.description && game.description.toLowerCase().includes(searchLower));
    });

    // Sayfalama işlemleri
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage + 1); // Material-UI sayfalama 0-tabanlı, API'miz 1-tabanlı
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    // Silme işlemleri
    const handleDeleteConfirm = async () => {
        if (gameToDelete === null) return;

        const success = await deleteGame(gameToDelete);
        if (success) {
            setDeleteDialogOpen(false);
            setGameToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setGameToDelete(null);
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

    return (
        <Box sx={{
            width: '100%',
            px: 2,            // Responsive boşluk (varsayılan container gibi)
            boxSizing: 'border-box'
        }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Oyun Yönetimi
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
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

                </Grid>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : filteredGames.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <Typography>Oyun bulunamadı.</Typography>
                </Paper>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {filteredGames.map((game) => (
                            <Grid item xs={12} sm={6} md={4} key={game.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                                    <CardMedia
                                        component="div"
                                        sx={{
                                            height: 140,
                                            backgroundColor: game.type === 'jeopardy' ? '#3f51b5' : '#f50057',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {getGameTypeLabel(game.type)}
                                    </CardMedia>

                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                                {game.name}
                                            </Typography>
                                            <Chip
                                                label={game.is_active ? 'Aktif' : 'Pasif'}
                                                color={game.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {game.description || 'Açıklama yok'}
                                        </Typography>

                                        {game.creator && (
                                            <Typography variant="body2">
                                                <strong>Oluşturan:</strong> {game.creator.name}
                                            </Typography>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Button
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            component={Link}
                                            to={`/games/${game.id}`}
                                        >
                                            Detaylar
                                        </Button>
                                </CardActions>
                            </Card>
                            </Grid>
                            ))}
                    </Grid>

                    {!loading && pagination && (
                    <Paper sx={{ mt: 3, borderRadius: 2 }}>
                        <TablePagination
                            component="div"
                            count={pagination.total}
                            rowsPerPage={rowsPerPage}
                            page={pagination.current_page - 1} // API'den 1-tabanlı, MUI'de 0-tabanlı
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[6, 12, 24]}
                            labelRowsPerPage="Sayfa başına oyun:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                        />
                    </Paper>
                    )}
                </>
            )}

            {/* Silme Onay Dialogu */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Oyunu Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu oyunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={loading}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GameList;