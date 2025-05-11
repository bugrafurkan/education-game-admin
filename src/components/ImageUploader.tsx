// src/components/ImageUploader.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, TextField, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tabs, Tab, IconButton, Paper, Grid, InputAdornment,
    Card, CardMedia, CardContent, CardActionArea, Pagination
} from '@mui/material';
import {
    Upload as UploadIcon,
    Search as SearchIcon,
    ContentPaste as PasteIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import * as questionService from '../services/question.service';

interface ImageUploaderProps {
    imagePath: string | null;
    onImagePathChange: (path: string | null) => void;
    onError: (error: string | null) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

// Tab Panel Componenti
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`image-uploader-tabpanel-${index}`}
            aria-labelledby={`image-uploader-tab-${index}`}
            {...other}
            style={{ minHeight: '300px' }}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imagePath, onImagePathChange, onError }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Dosya seçimi için ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Yapıştırma alanı için ref ve state
    const pasteAreaRef = useRef<HTMLDivElement>(null);
    const [pastedImage, setPastedImage] = useState<string | null>(null);

    // Google arama için state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<questionService.GoogleImage[]>([]);
    const [searchTotal, setSearchTotal] = useState(0);
    const [searchPage, setSearchPage] = useState(1);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Dialog'u açma
    const handleOpenDialog = () => {
        setOpenDialog(true);
        setTabValue(0);
        setPastedImage(null);
        setSearchQuery('');
        setSearchResults([]);
        setSearchError(null);
    };

    // Dialog'u kapatma
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Tab değiştirme
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Dosya seçimi işleyicisi
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Dosya boyutu kontrolü (2MB)
        if (file.size > 2 * 1024 * 1024) {
            onError("Dosya boyutu 2MB'dan küçük olmalıdır.");
            return;
        }

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
            onError("Sadece resim dosyaları yüklenebilir.");
            return;
        }

        try {
            setLoading(true);

            // Dosyayı sunucuya yükle
            const response = await questionService.uploadImage(file);

            // Başarılı ise yolunu ayarla
            onImagePathChange(response.url);
            onError(null);

            // Dialog'u kapat
            handleCloseDialog();
        } catch (error) {
            console.error('Dosya yükleme hatası:', error);
            onError('Dosya yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Görsel yapıştırma işlemi
    const handlePaste = (event: React.ClipboardEvent | ClipboardEvent) => {
        console.log("Paste event triggered"); // Debug için log ekleyin

        const items = event.clipboardData?.items;
        if (!items) {
            console.log("No clipboard data items found");
            return;
        }

        console.log(`Found ${items.length} items in clipboard`);

        for (let i = 0; i < items.length; i++) {
            console.log(`Item ${i} type: ${items[i].type}`);

            if (items[i].type.indexOf('image') !== -1) {
                // Görsel bulundu
                const file = items[i].getAsFile();
                if (!file) {
                    console.log("Could not get file from clipboard item");
                    continue;
                }

                console.log(`Got image file: ${file.name}, size: ${file.size}`);

                // Dosya boyutu kontrolü
                if (file.size > 2 * 1024 * 1024) {
                    onError("Dosya boyutu 2MB'dan küçük olmalıdır.");
                    return;
                }

                // Dosyayı göster
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    setPastedImage(result);
                };
                reader.readAsDataURL(file);

                // Event'i engelle
                event.preventDefault();
                break;
            }
        }
    };

    // Yapıştırılan görseli yükle
    const handleUploadPastedImage = async () => {
        if (!pastedImage) return;

        try {
            setLoading(true);

            // Base64 görsel verisi gönder
            const response = await questionService.uploadBase64Image(pastedImage);

            // Başarılı ise yolunu ayarla
            onImagePathChange(response.url);
            onError(null);

            // Dialog'u kapat
            handleCloseDialog();
        } catch (error) {
            console.error('Yapıştırılan görsel yükleme hatası:', error);
            onError('Görsel yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Google'dan görsel arama
    const handleSearchImages = async () => {
        if (!searchQuery.trim()) return;

        try {
            setSearching(true);
            setSearchError(null);

            const result = await questionService.searchImages(searchQuery, searchPage);

            setSearchResults(result.images);
            setSearchTotal(result.total);

        } catch (error) {
            console.error('Görsel arama hatası:', error);
            setSearchError('Görsel aranırken bir hata oluştu.');
        } finally {
            setSearching(false);
        }
    };

    // Arama sayfası değiştirme
    const handleSearchPageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setSearchPage(page);
    };

    // Sayfa değiştiğinde yeniden ara
    useEffect(() => {
        if (searchQuery.trim()) {
            handleSearchImages();
        }
    }, [searchPage]);

    // Google görselini seç ve indir
    const handleSelectGoogleImage = async (imageUrl: string) => {
        try {
            setLoading(true);

            // Görseli sunucuya indir
            const response = await questionService.saveExternalImage(imageUrl);

            // Başarılı ise yolunu ayarla
            onImagePathChange(response.url);
            onError(null);

            // Dialog'u kapat
            handleCloseDialog();
        } catch (error) {
            console.error('Harici görsel indirme hatası:', error);
            onError('Görsel indirilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Yapıştırma alanı için event listener'lar
    useEffect(() => {
        const pasteArea = pasteAreaRef.current;
        if (!pasteArea) return;

        // React event handler'ını kullan
        const handlePasteEvent = (e: ClipboardEvent) => {
            console.log("Paste event caught by listener");
            handlePaste(e);
        };

        // Tüm document'a paste eventi ekleyin (daha geniş kapsam)
        document.addEventListener('paste', handlePasteEvent);

        return () => {
            document.removeEventListener('paste', handlePasteEvent);
        };
    }, []);

    return (
        <Box>
            {/* Görsel Önizleme ve Butonlar */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Soru Resmi (Opsiyonel)
            </Typography>

            {imagePath ? (
                <Box sx={{ mb: 2, position: 'relative', width: 'fit-content' }}>
                    <img
                        src={imagePath}
                        alt="Soru resmi"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => onImagePathChange(null)}
                        sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            minWidth: '30px',
                            width: '30px',
                            height: '30px',
                            p: 0
                        }}
                    >
                        X
                    </Button>
                </Box>
            ) : (
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        onClick={handleOpenDialog}
                        startIcon={<UploadIcon />}
                    >
                        Görsel Ekle
                    </Button>
                </Box>
            )}

            {/* Görsel Yükleme Dialog'u */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Görsel Ekle
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialog}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    {/* Sekme Başlıkları */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="image upload options">
                            <Tab label="Dosya Seç" id="image-uploader-tab-0" />
                            <Tab label="Kopyala/Yapıştır" id="image-uploader-tab-1" />
                            <Tab label="İnternetten Bul" id="image-uploader-tab-2" />
                        </Tabs>
                    </Box>

                    {/* Dosya Seçme Sekmesi */}
                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="contained"
                                startIcon={<UploadIcon />}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                Bilgisayardan Dosya Seç
                            </Button>
                            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                Maksimum dosya boyutu: 2MB
                            </Typography>
                        </Box>
                    </TabPanel>

                    {/* Kopyala/Yapıştır Sekmesi */}
                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {pastedImage ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body1" gutterBottom>
                                        Yapıştırılan Görsel:
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <img
                                            src={pastedImage}
                                            alt="Yapıştırılan görsel"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => setPastedImage(null)}
                                        >
                                            Temizle
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleUploadPastedImage}
                                            disabled={loading}
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'Bu Görseli Kullan'}
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Paper
                                    ref={pasteAreaRef}
                                    sx={{
                                        width: '100%',
                                        height: '200px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        border: '2px dashed #ccc',
                                        borderRadius: 2,
                                        p: 2,
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                    tabIndex={0} // Keyboard ile odaklanabilir yapar
                                    onClick={() => pasteAreaRef.current?.focus()} // Tıklama ile odaklama
                                    onPaste={(e) => handlePaste(e as unknown as ClipboardEvent)} // React event'ini doğrudan kullan

                                >
                                    <PasteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Buraya Görsel Yapıştırın
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        Kopyalanmış bir görseli Ctrl+V (veya Cmd+V) ile yapıştırın
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </TabPanel>

                    {/* İnternetten Bulma Sekmesi */}
                    <TabPanel value={tabValue} index={2}>
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Görsel Ara"
                                variant="outlined"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleSearchImages}
                                                disabled={searching || !searchQuery.trim()}
                                            >
                                                {searching ? <CircularProgress size={24} /> : <SearchIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchImages();
                                    }
                                }}
                            />

                            {searchError && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {searchError}
                                </Alert>
                            )}
                        </Box>

                        {/* Arama Sonuçları */}
                        {searchResults.length > 0 ? (
                            <Box>
                                <Grid container spacing={2}>
                                    {searchResults.map((image) => (
                                        <Grid item xs={12} sm={6} md={4} key={image.id}>
                                            <Card>
                                                <CardActionArea onClick={() => handleSelectGoogleImage(image.large_image_url)}>
                                                    <CardMedia
                                                        component="img"
                                                        image={image.preview_url}
                                                        alt={image.title}
                                                        height="120"
                                                        sx={{ objectFit: 'cover' }}
                                                    />
                                                    <CardContent sx={{ p: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {image.source}
                                                        </Typography>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Sayfalama */}
                                {searchTotal > 10 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Pagination
                                            count={Math.min(Math.ceil(searchTotal / 10), 10)} // Google API max 10 sayfa
                                            page={searchPage}
                                            onChange={handleSearchPageChange}
                                            color="primary"
                                        />
                                    </Box>
                                )}
                            </Box>
                        ) : searching ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : searchQuery.trim() ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography>Sonuç bulunamadı. Başka bir arama yapmayı deneyin.</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography>Aramak istediğiniz görseli yazın</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Google Images ile milyonlarca görsele erişin
                                </Typography>
                            </Box>
                        )}

                        {/* Google Atıf */}
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Görseller Google Images tarafından sağlanmaktadır.
                            </Typography>
                        </Box>
                    </TabPanel>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">
                        İptal
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Yükleme Göstergesi (ana ekranda) */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}
        </Box>
    );
};

export default ImageUploader;