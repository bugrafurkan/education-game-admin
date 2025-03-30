// src/pages/settings/Settings.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Grid, TextField, Switch,
    FormControlLabel, Tabs, Tab, Divider, Alert, Snackbar,
    RadioGroup, Radio, FormControl, FormLabel, CircularProgress
} from '@mui/material';
import { Save as SaveIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useSettings } from '../../hooks/useSettings';
import { Settings as SettingsType } from '../../services/settings.service';

interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
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

const Settings = () => {
    const [tabValue, setTabValue] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const { settings, loading, error, updateSettings, isSubmitting } = useSettings();

    // Form state
    const [appName, setAppName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [themeColor, setThemeColor] = useState('');
    const [adsEnabled, setAdsEnabled] = useState(false);
    const [adType, setAdType] = useState<'image' | 'video'>('image');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Ayarlar yüklendiğinde form state'ini güncelle
    useEffect(() => {
        if (settings) {
            // Genel ayarlar
            setAppName(settings.general.app_name);
            setLogoUrl(settings.general.logo_url);
            setThemeColor(settings.general.theme_color);

            // Reklam ayarları
            setAdsEnabled(settings.advertisements.ads_enabled);
            setAdType(settings.advertisements.ad_type);

            // Eğer kaydedilmiş bir reklam dosyası varsa önizleme göster
            if (settings.advertisements.ad_file_url) {
                setPreviewUrl(settings.advertisements.ad_file_url);
            }
        }
    }, [settings]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSaveSettings = async () => {
        const newSettings: Partial<SettingsType> = {
            general: {
                app_name: appName,
                logo_url: logoUrl,
                theme_color: themeColor
            },
            advertisements: {
                ads_enabled: adsEnabled,
                ad_type: adType
            }
        };

        // Eğer yeni bir dosya seçilmişse ekle
        if (selectedFile) {
            newSettings.advertisements!.ad_file = selectedFile;
        }

        const success = await updateSettings(newSettings);
        if (success) {
            setShowSuccess(true);
            // Dosya seçimi temizleme (kayıt başarılı ise)
            setSelectedFile(null);
        }
    };

    const handleCloseSuccessMessage = () => {
        setShowSuccess(false);
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

            // Önizleme URL'i oluştur
            const fileURL = URL.createObjectURL(file);
            setPreviewUrl(fileURL);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                Ayarlar yüklenirken bir hata oluştu: {error.message}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Sistem Ayarları
            </Typography>

            <Paper sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
                        <Tab label="Genel Ayarlar" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
                        <Tab label="Reklam Ayarları" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Genel Ayarlar
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Platformun genel görünüm ve işleyiş ayarlarını yapılandırın.
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Platform Adı"
                                            fullWidth
                                            value={appName}
                                            onChange={(e) => setAppName(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Logo URL"
                                            fullWidth
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                            helperText="Logo için tam URL adresi"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Tema Rengi"
                                            fullWidth
                                            value={themeColor}
                                            onChange={(e) => setThemeColor(e.target.value)}
                                            helperText="HEX formatında renk kodu (örn: #1a1a27)"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Reklam Ayarları
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Online oyunlarda gösterilecek reklamların ayarlarını yapılandırın.
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={adsEnabled}
                                                    onChange={(e) => setAdsEnabled(e.target.checked)}
                                                />
                                            }
                                            label="Reklamları Etkinleştir"
                                        />
                                    </Grid>

                                    {adsEnabled && (
                                        <>
                                            <Grid item xs={12}>
                                                <FormControl component="fieldset">
                                                    <FormLabel component="legend">Reklam Tipi</FormLabel>
                                                    <RadioGroup
                                                        row
                                                        value={adType}
                                                        onChange={(e) => {
                                                            setAdType(e.target.value as 'image' | 'video');
                                                            // Reklam tipi değiştiğinde seçili dosyayı sıfırla
                                                            setSelectedFile(null);
                                                            setPreviewUrl(settings?.advertisements.ad_file_url || null);
                                                        }}
                                                    >
                                                        <FormControlLabel value="image" control={<Radio />} label="Görsel Reklam" />
                                                        <FormControlLabel value="video" control={<Radio />} label="Video Reklam" />
                                                    </RadioGroup>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Box sx={{ border: '1px dashed #ccc', p: 3, borderRadius: 2, textAlign: 'center' }}>
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
                                                        {selectedFile
                                                            ? selectedFile.name
                                                            : settings?.advertisements.ad_file_url
                                                                ? 'Mevcut reklam dosyası. Değiştirmek için yeni dosya seçin.'
                                                                : `Lütfen bir ${adType === 'image' ? 'görsel' : 'video'} dosyası seçin.`
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            {previewUrl && (
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Önizleme:
                                                    </Typography>
                                                    <Box sx={{ mt: 1, maxWidth: '100%', textAlign: 'center' }}>
                                                        {adType === 'image' ? (
                                                            <img
                                                                src={previewUrl}
                                                                alt="Reklam önizleme"
                                                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                                                            />
                                                        ) : (
                                                            <video
                                                                src={previewUrl}
                                                                controls
                                                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Grid>
                                            )}
                                        </>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveSettings}
                            disabled={isSubmitting}
                            sx={{
                                py: 1.5,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                        >
                            {isSubmitting ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Snackbar
                open={showSuccess}
                autoHideDuration={6000}
                onClose={handleCloseSuccessMessage}
                message="Ayarlar başarıyla kaydedildi"
            />
        </Box>
    );
};

export default Settings;