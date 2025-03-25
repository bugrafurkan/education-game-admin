// src/pages/settings/Settings.tsx
import { useState } from 'react';
import {
    Box, Typography, Paper, Button, Grid, TextField, Switch,
    FormControlLabel, Tabs, Tab, Divider, Alert, Snackbar
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

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
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Genel ayarlar
    const [appName, setAppName] = useState('Eğitim Oyun Platformu');
    const [logoUrl, setLogoUrl] = useState('/assets/logo.png');
    const [themeColor, setThemeColor] = useState('#1a1a27');

    // Fernus entegrasyonu
    const [fernusApiKey, setFernusApiKey] = useState('');
    const [fernusApiUrl, setFernusApiUrl] = useState('https://api.fernus.example.com');
    const [fernusEnabled, setFernusEnabled] = useState(true);

    // Reklam ayarları
    const [adsEnabled, setAdsEnabled] = useState(true);
    const [defaultBanner, setDefaultBanner] = useState('/assets/default-banner.png');

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSaveSettings = () => {
        setSaving(true);

        // Simüle edilmiş API çağrısı
        setTimeout(() => {
            setSaving(false);
            setShowSuccess(true);
        }, 1000);
    };

    const handleCloseSuccessMessage = () => {
        setShowSuccess(false);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Sistem Ayarları
            </Typography>

            <Paper sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
                        <Tab label="Genel Ayarlar" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
                        <Tab label="Fernus Entegrasyonu" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
                        <Tab label="Reklam Ayarları" id="settings-tab-2" aria-controls="settings-tabpanel-2" />
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
                                    Fernus Entegrasyonu
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Fernus platformu ile entegrasyon ayarlarını yapılandırın.
                                </Typography>

                                <Alert severity="info" sx={{ mb: 3 }}>
                                    Fernus, WebGL oyunlarını akıllı tahtalara dağıtmak için kullanılan bir platformdur.
                                </Alert>

                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={fernusEnabled}
                                                    onChange={(e) => setFernusEnabled(e.target.checked)}
                                                />
                                            }
                                            label="Fernus Entegrasyonunu Etkinleştir"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Fernus API Anahtarı"
                                            fullWidth
                                            value={fernusApiKey}
                                            onChange={(e) => setFernusApiKey(e.target.value)}
                                            disabled={!fernusEnabled}
                                            type="password"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Fernus API URL"
                                            fullWidth
                                            value={fernusApiUrl}
                                            onChange={(e) => setFernusApiUrl(e.target.value)}
                                            disabled={!fernusEnabled}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
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

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Varsayılan Banner URL"
                                            fullWidth
                                            value={defaultBanner}
                                            onChange={(e) => setDefaultBanner(e.target.value)}
                                            disabled={!adsEnabled}
                                            helperText="Özel reklam yoksa gösterilecek varsayılan banner"
                                        />
                                    </Grid>
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
                            disabled={saving}
                            sx={{
                                py: 1.5,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                        >
                            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
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