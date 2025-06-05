// src/pages/publishers/PublisherList.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Alert, CircularProgress, Chip, Grid, InputAdornment,
    Tooltip, Fab
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { usePublishers } from '../../hooks/usePublishers';

interface Publisher {
    id: number;
    name: string;
    created_at?: string;
    questions_count?: number; // Varsa publisher'a ait soru sayısı
}

const PublisherList = () => {
    const { publishers, loading: publishersLoading, createPublisher, deletePublisher, updatePublisher } = usePublishers();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Dialog states
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Form states
    const [publisherName, setPublisherName] = useState('');
    const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);

    // Filtreleme
    const filteredPublishers = publishers.filter(publisher =>
        publisher.name.toLowerCase().includes(search.toLowerCase())
    );

    // Success ve error mesajlarını otomatik temizle
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Publisher ekleme
    const handleAddPublisher = async () => {
        if (!publisherName.trim()) {
            setError('Yayınevi adı boş olamaz!');
            return;
        }

        // Aynı isimde publisher var mı kontrol et
        if (publishers.some(p => p.name.toLowerCase() === publisherName.toLowerCase())) {
            setError('Bu isimde bir yayınevi zaten mevcut!');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await createPublisher(publisherName.trim());

            setSuccess('Yayınevi başarıyla eklendi!');
            setAddDialogOpen(false);
            setPublisherName('');
        } catch (err) {
            console.error('Publisher ekleme hatası:', err);
            setError('Yayınevi eklenirken bir hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    // Publisher düzenleme - Hook'ta update metodu olmadığı için kaldırıldı
    const handleEditPublisher = async () => {
        if (!selectedPublisher) return;
        else{
            if (!publisherName.trim()) {
                setError('Yayınevi adı boş olamaz!');
                return;
            }

            if (publishers.some(p => p.name.toLowerCase() === publisherName.toLowerCase())) {
                setError('Bu isimde bir yayınevi zaten mevcut!');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                await updatePublisher(selectedPublisher.id,publisherName.trim());

                setSuccess('Yayınevi başarıyla güncellendi!');
                setEditDialogOpen(false);
                setSelectedPublisher(null);
            } catch (err) {
                console.error('Publisher güncelleme hatası:', err);
                setError('Yayınevi güncellenirken bir hata oluştu!');
            } finally {
                setLoading(false);
            }
        }

    };

    // Publisher silme
    const handleDeletePublisher = async () => {
        if (!selectedPublisher) return;

        try {
            setLoading(true);
            setError(null);

            await deletePublisher(selectedPublisher.id);

            setSuccess('Yayınevi başarıyla silindi!');
            setDeleteDialogOpen(false);
            setSelectedPublisher(null);
        } catch (err) {
            console.error('Publisher silme hatası:', err);
            setError('Yayınevi silinirken bir hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    // Dialog açma fonksiyonları
    const openAddDialog = () => {
        setPublisherName('');
        setError(null);
        setAddDialogOpen(true);
    };

    const openEditDialog = (publisher: Publisher) => {
        setSelectedPublisher(publisher);
        setPublisherName(publisher.name);
        setError(null);
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (publisher: Publisher) => {
        setSelectedPublisher(publisher);
        setError(null);
        setDeleteDialogOpen(true);
    };

    // Dialog kapatma
    const closeDialogs = () => {
        setAddDialogOpen(false);
        setEditDialogOpen(false);
        setDeleteDialogOpen(false);
        setPublisherName('');
        setSelectedPublisher(null);
        setError(null);
    };

    // Enter tuşu ile kaydetme
    const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (action === 'add') {
                handleAddPublisher();
            } else {
                handleEditPublisher();
            }
        }
    };

    return (
        <Box sx={{
            width: '100%',
            px: 2,
            boxSizing: 'border-box'
        }}>
            {/* Başlık */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" sx={{ fontSize: 30 }} />
                    <Typography variant="h4" fontWeight="bold">
                        Yayınevi Yönetimi
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    sx={{ py: 1.5, px: 3 }}
                >
                    Yeni Yayınevi
                </Button>
            </Box>

            {/* Arama ve İstatistikler */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Yayınevi Ara"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Chip
                                label={`Toplam: ${publishers.length}`}
                                color="primary"
                                variant="outlined"
                            />
                            <Chip
                                label={`Gösterilen: ${filteredPublishers.length}`}
                                color="secondary"
                                variant="outlined"
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Mesajlar */}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Publishers Tablosu */}
            <Paper sx={{ borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f8fa' }}>
                            <TableRow>
                                <TableCell width="10%">#</TableCell>
                                <TableCell width="60%">Yayınevi Adı</TableCell>
                                <TableCell width="15%" align="center">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {publishersLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredPublishers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        {search ? 'Arama kriterinize uygun yayınevi bulunamadı.' : 'Henüz yayınevi eklenmemiş.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPublishers.map((publisher, index) => (
                                    <TableRow key={publisher.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={index + 1}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <BusinessIcon color="action" fontSize="small" />
                                                <Typography fontWeight="medium">
                                                    {publisher.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title="Düzenle (Yakında)">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => openEditDialog(publisher)}

                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => openDeleteDialog(publisher)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Floating Action Button - Mobile için */}
            <Fab
                color="primary"
                aria-label="Yeni Yayınevi Ekle"
                onClick={openAddDialog}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', sm: 'none' }
                }}
            >
                <AddIcon />
            </Fab>

            {/* Yayınevi Ekleme Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={closeDialogs}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon color="primary" />
                        Yeni Yayınevi Ekle
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Yayınevi Adı"
                        fullWidth
                        variant="outlined"
                        value={publisherName}
                        onChange={(e) => setPublisherName(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'add')}
                        error={!!error}
                        helperText={error || "Yayınevi adını girin"}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={closeDialogs}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleAddPublisher}
                        variant="contained"
                        disabled={loading || !publisherName.trim()}
                        startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
                    >
                        {loading ? 'Ekleniyor...' : 'Ekle'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Yayınevi Düzenleme Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={closeDialogs}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon color="primary" />
                        Yayınevi Düzenle
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Yayınevi Adı"
                        fullWidth
                        variant="outlined"
                        value={publisherName}
                        onChange={(e) => setPublisherName(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'edit')}
                        error={!!error}
                        helperText={error || "Yayınevi adını düzenleyin"}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={closeDialogs}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleEditPublisher}
                        variant="contained"
                        disabled={loading || !publisherName.trim()}
                        startIcon={loading ? <CircularProgress size={16} /> : <EditIcon />}
                    >
                        {loading ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Yayınevi Silme Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDialogs}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeleteIcon color="error" />
                        Yayınevi Sil
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>"{selectedPublisher?.name}"</strong> yayınevini silmek istediğinize emin misiniz?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Bu işlem geri alınamaz. Ancak bu yayınevine ait sorular silinmeyecektir.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={closeDialogs}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeletePublisher}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
                    >
                        {loading ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PublisherList;