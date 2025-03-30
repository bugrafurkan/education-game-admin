// src/pages/advertisements/Advertisements.tsx
import { useState } from 'react';
import {
    Box, Typography, Paper, Button,  TextField,
    FormControlLabel,  Alert, Snackbar, CircularProgress,
    IconButton, RadioGroup,
    Radio, FormControl, FormLabel, Dialog, DialogTitle,
    DialogContent, DialogActions, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
    Add as AddIcon,
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAdvertisements } from '../../hooks/useAdvertisement';

const Advertisements = () => {
    const {
        advertisements,
        loading,
        error,
        addAdvertisement,
        toggleAdvertisementStatus,
        removeAdvertisement,
        isSubmitting
    } = useAdvertisements();

    const [openDialog, setOpenDialog] = useState(false);
    const [adName, setAdName] = useState('');
    const [adType, setAdType] = useState<'image' | 'video'>('image');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        resetForm();
    };

    const resetForm = () => {
        setAdName('');
        setAdType('image');
        setSelectedFile(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            // Dosya tipini kontrol et
            const isValidFileType = adType === 'image'
                ? file.type.startsWith('image/')
                : file.type.startsWith('video/');

            if (!isValidFileType) {
                alert(`Lütfen geçerli bir ${adType === 'image' ? 'görsel' : 'video'} dosyası seçin.`);
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!adName.trim()) {
            alert('Lütfen bir reklam adı girin.');
            return;
        }

        if (!selectedFile) {
            alert('Lütfen bir dosya seçin.');
            return;
        }

        const success = await addAdvertisement(adName, adType, selectedFile);
        if (success) {
            setSuccessMessage('Reklam başarıyla eklendi.');
            handleCloseDialog();
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        const success = await toggleAdvertisementStatus(id, !currentStatus);
        if (success) {
            setSuccessMessage(
                `Reklam ${!currentStatus ? 'aktifleştirildi' : 'deaktif edildi'}.`
            );
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu reklamı silmek istediğinizden emin misiniz?')) {
            const success = await removeAdvertisement(id);
            if (success) {
                setSuccessMessage('Reklam başarıyla silindi.');
            }
        }
    };

    const handleCloseSuccessMessage = () => {
        setSuccessMessage(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Reklam Yönetimi
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    sx={{
                        py: 1.5,
                        px: 3,
                        bgcolor: '#1a1a27',
                        '&:hover': { bgcolor: '#2a2a37' }
                    }}
                >
                    Yeni Reklam Ekle
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 4 }}>
                    {error.message}
                </Alert>
            )}

            {advertisements.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz reklam eklenmemiş
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        sx={{ mt: 2 }}
                    >
                        İlk Reklamı Ekle
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell width="40%">Reklam Adı</TableCell>
                                <TableCell width="15%">Tür</TableCell>
                                <TableCell width="15%">Durum</TableCell>
                                <TableCell width="15%">Eklenme Tarihi</TableCell>
                                <TableCell width="15%" align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {advertisements.map((ad) => (
                                <TableRow key={ad.id} hover>
                                    <TableCell>
                                        <Typography variant="body1">{ad.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ad.type === 'image' ? 'Görsel' : 'Video'}
                                            color={ad.type === 'image' ? 'primary' : 'secondary'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ad.is_active ? 'Aktif' : 'Pasif'}
                                            color={ad.is_active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(ad.created_at)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color={ad.is_active ? 'primary' : 'default'}
                                            onClick={() => handleToggleStatus(ad.id, ad.is_active)}
                                            title={ad.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                            size="small"
                                        >
                                            {ad.is_active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(ad.id)}
                                            title="Sil"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Yeni Reklam Ekleme Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Yeni Reklam Ekle</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            label="Reklam Adı"
                            fullWidth
                            value={adName}
                            onChange={(e) => setAdName(e.target.value)}
                            margin="normal"
                        />

                        <FormControl component="fieldset" sx={{ mt: 2, mb: 1 }}>
                            <FormLabel component="legend">Reklam Tipi</FormLabel>
                            <RadioGroup
                                row
                                value={adType}
                                onChange={(e) => {
                                    setAdType(e.target.value as 'image' | 'video');
                                    setSelectedFile(null);
                                }}
                            >
                                <FormControlLabel value="image" control={<Radio />} label="Görsel Reklam" />
                                <FormControlLabel value="video" control={<Radio />} label="Video Reklam" />
                            </RadioGroup>
                        </FormControl>

                        <Box sx={{ border: '1px dashed #ccc', p: 3, borderRadius: 2, textAlign: 'center', mt: 2 }}>
                            <input
                                accept={adType === 'image' ? "image/*" : "video/*"}
                                style={{ display: 'none' }}
                                id="ad-file-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="ad-file-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<UploadIcon />}
                                >
                                    {adType === 'image' ? 'Görsel Seç' : 'Video Seç'}
                                </Button>
                            </label>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {selectedFile ? selectedFile.name : `Lütfen bir ${adType === 'image' ? 'görsel' : 'video'} dosyası seçin.`}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">
                        İptal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting || !selectedFile || !adName.trim()}
                        sx={{
                            bgcolor: '#1a1a27',
                            '&:hover': { bgcolor: '#2a2a37' }
                        }}
                    >
                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={handleCloseSuccessMessage}
                message={successMessage}
            />
        </Box>
    );
};

export default Advertisements;