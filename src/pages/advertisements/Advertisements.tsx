// src/pages/advertisements/Advertisements.tsx
import { useState } from 'react';
import {
    Box, Typography, Paper, Button, TextField,
    FormControlLabel, Alert, Snackbar, CircularProgress,
    IconButton, RadioGroup, Radio, FormControl, FormLabel,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAdvertisements } from '../../hooks/useAdvertisement';
import { Advertisement } from '../../services/advertisement.service';

// React DatePicker kullanımı
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { tr } from 'date-fns/locale';
import './datepicker-custom.css'; // Özel CSS dosyası (oluşturmanız gerekecek)

// Türkçe dil desteği ekleme
registerLocale('tr', tr);
setDefaultLocale('tr');

const Advertisements = () => {
    const {
        advertisements,
        loading,
        error,
        addAdvertisement,
        updateAdDetails,
        toggleAdvertisementStatus,
        removeAdvertisement,
        isSubmitting
    } = useAdvertisements();

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);

    const [adName, setAdName] = useState('');
    const [adType, setAdType] = useState<'image' | 'video'>('image');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleOpenDialog = (isEdit = false, ad?: Advertisement) => {
        if (isEdit && ad) {
            setIsEditMode(true);
            setCurrentAd(ad);
            setAdName(ad.name);
            setAdType(ad.type);
            setStartDate(ad.start_date ? new Date(ad.start_date) : null);
            setEndDate(ad.end_date ? new Date(ad.end_date) : null);
            setGrade(ad.grade || '');
            setSubject(ad.subject || '');
        } else {
            setIsEditMode(false);
            setCurrentAd(null);
            resetForm();
        }
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
        setStartDate(null);
        setEndDate(null);
        setGrade('');
        setSubject('');
        setIsEditMode(false);
        setCurrentAd(null);
    };

    // Tarihi değiştirme işleyicileri
    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);

        // Eğer bitiş tarihi varsa ve yeni başlangıç tarihinden önceyse bitiş tarihini sıfırla
        if (date && endDate && date > endDate) {
            setEndDate(null);
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
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

        if (!startDate) {
            alert('Lütfen bir başlangıç tarihi seçin.');
            return;
        }

        // Eğer düzenleme modundaysak
        if (isEditMode && currentAd) {
            const success = await updateAdDetails(currentAd.id, {
                name: adName,
                start_date: startDate.toISOString(),
                end_date: endDate ? endDate.toISOString() : null,
                grade: grade || undefined,
                subject: subject || undefined
            });

            if (success) {
                setSuccessMessage('Reklam başarıyla güncellendi.');
                handleCloseDialog();
            }
        }
        // Yeni reklam ekleme
        else {
            if (!selectedFile) {
                alert('Lütfen bir dosya seçin.');
                return;
            }

            const success = await addAdvertisement(
                adName,
                adType,
                selectedFile,
                startDate.toISOString(),
                endDate ? endDate.toISOString() : null,
                grade || undefined,
                subject || undefined
            );

            if (success) {
                setSuccessMessage('Reklam başarıyla eklendi.');
                handleCloseDialog();
            }
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        const success = await toggleAdvertisementStatus(id, !currentStatus);
        if (success) {
            setSuccessMessage(`Reklam ${!currentStatus ? 'aktifleştirildi' : 'deaktif edildi'}.`);
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
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
                    onClick={() => handleOpenDialog()}
                    sx={{ py: 1.5, px: 3, bgcolor: '#1a1a27', '&:hover': { bgcolor: '#2a2a37' } }}
                >
                    YENİ REKLAM EKLE
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
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mt: 2 }}>
                        İlk Reklamı Ekle
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell width="20%">Reklam Adı</TableCell>
                                <TableCell width="10%">Tür</TableCell>
                                <TableCell width="10%">Durum</TableCell>
                                <TableCell width="10%">Sınıf</TableCell>
                                <TableCell width="10%">Ders</TableCell>
                                <TableCell width="13%">Başlangıç Tarihi</TableCell>
                                <TableCell width="13%">Bitiş Tarihi</TableCell>
                                <TableCell width="14%" align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {advertisements.map((ad) => (
                                <TableRow key={ad.id} hover>
                                    <TableCell><Typography>{ad.name}</Typography></TableCell>
                                    <TableCell>
                                        <Chip label={ad.type === 'image' ? 'Görsel' : 'Video'} color={ad.type === 'image' ? 'primary' : 'secondary'} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={ad.is_active ? 'Aktif' : 'Pasif'} color={ad.is_active ? 'success' : 'default'} size="small" />
                                    </TableCell>
                                    <TableCell>{ad.grade || '-'}</TableCell>
                                    <TableCell>{ad.subject || '-'}</TableCell>
                                    <TableCell><Typography variant="body2">{formatDate(ad.start_date)}</Typography></TableCell>
                                    <TableCell><Typography variant="body2">{ad.end_date ? formatDate(ad.end_date) : '-'}</Typography></TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={ad.is_active ? "Devre Dışı Bırak" : "Aktifleştir"}>
                                            <IconButton
                                                color={ad.is_active ? "success" : "default"}
                                                onClick={() => handleToggleStatus(ad.id, ad.is_active)}
                                                size="small"
                                            >
                                                {ad.is_active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Düzenle">
                                            <IconButton color="primary" onClick={() => handleOpenDialog(true, ad)} size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Sil">
                                            <IconButton color="error" onClick={() => handleDelete(ad.id)} size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditMode ? 'Reklamı Düzenle' : 'Yeni Reklam Ekle'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            label="Reklam Adı"
                            fullWidth
                            value={adName}
                            onChange={(e) => setAdName(e.target.value)}
                            margin="normal"
                        />

                        <Box sx={{ mt: 2, mb: 1 }}>
                            <FormLabel component="legend" sx={{ mb: 1 }}>Başlangıç Tarihi</FormLabel>
                            <DatePicker
                                selected={startDate}
                                onChange={handleStartDateChange}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Başlangıç Tarihi"
                                className="custom-datepicker"
                                locale="tr"
                                wrapperClassName="datepicker-wrapper"
                                maxDate={endDate || undefined} // Eğer endDate varsa, onu maksimum değer olarak ayarla
                            />
                        </Box>

                        <Box sx={{ mt: 2, mb: 1 }}>
                            <FormLabel component="legend" sx={{ mb: 1 }}>Bitiş Tarihi (Opsiyonel)</FormLabel>
                            <DatePicker
                                selected={endDate}
                                onChange={handleEndDateChange}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Bitiş Tarihi (Opsiyonel)"
                                className="custom-datepicker"
                                locale="tr"
                                wrapperClassName="datepicker-wrapper"
                                minDate={startDate || undefined} // Eğer startDate varsa, onu minimum değer olarak ayarla
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField
                                label="Sınıf (Grade)"
                                fullWidth
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                            />
                            <TextField
                                label="Ders (Subject)"
                                fullWidth
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </Box>

                        {!isEditMode && (
                            <>
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
                                        <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                                            {adType === 'image' ? 'Görsel Seç' : 'Video Seç'}
                                        </Button>
                                    </label>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {selectedFile ? selectedFile.name : `Lütfen bir ${adType === 'image' ? 'görsel' : 'video'} dosyası seçin.`}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">İptal</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting || (!isEditMode && !selectedFile) || !adName.trim() || !startDate}
                        sx={{ bgcolor: '#1a1a27', '&:hover': { bgcolor: '#2a2a37' } }}
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