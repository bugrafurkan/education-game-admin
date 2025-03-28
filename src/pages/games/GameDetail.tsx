// src/pages/games/GameDetail.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, Grid, Chip,
    List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
    IconButton, Tabs, Tab, Alert, CircularProgress, Dialog,
    DialogTitle, DialogContent, DialogContentText, DialogActions, TextField
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
import { useGame } from '../../hooks/useGame';
import axios, { AxiosError } from 'axios';

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

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

const GameDetail = () => {
    const { id } = useParams<{ id: string }>();
    const gameId = parseInt(id || '0');

    const {
        game, loading, error,  removeQuestion,
        getIframeCode, iframeCode, iframeLoading, iframeError
    } = useGame(gameId);

    const [tabValue, setTabValue] = useState(0);

    // Soru silme
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Soru silme işlemleri
    const handleDeleteClick = (questionId: number) => {
        setQuestionToDelete(questionId);
        setDeleteDialogOpen(true);
        setDeleteError(null);
    };

    const handleDeleteConfirm = async () => {
        if (questionToDelete === null || !game) return;

        setIsDeleting(true);
        try {
            const success = await removeQuestion(questionToDelete);
            if (success) {
                setDeleteDialogOpen(false);
                setQuestionToDelete(null);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                setDeleteError(axiosError.response?.data?.message || 'Soru oyundan çıkarılırken bir hata oluştu');
                console.error('Error removing question:', axiosError.response?.data);
            } else {
                setDeleteError('Soru oyundan çıkarılırken beklenmeyen bir hata oluştu');
                console.error('Unexpected error:', error);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setQuestionToDelete(null);
    };

    // iframe kodunu al
    const handleGetIframeCode = async () => {
        await getIframeCode();
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

    if (!game) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    Oyun Detayı
                </Typography>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>Oyun bulunamadı.</Typography>
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
                    component={Link}
                    to={`/games/${game.id}/edit`}
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
                                {game.description || 'Bu oyun için açıklama bulunmuyor.'}
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
                                    {game.questions?.length || 0}
                                </Typography>
                            </Grid>

                            {game.creator && (
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Oluşturan
                                    </Typography>
                                    <Typography variant="body1">
                                        {game.creator.name}
                                    </Typography>
                                </Grid>
                            )}
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
                                onClick={handleGetIframeCode}
                                disabled={iframeLoading}
                                sx={{ mb: 2 }}
                            >
                                {iframeLoading ? 'Yükleniyor...' : 'iframe Kodu Al'}
                            </Button>

                            {iframeError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {iframeError}
                                </Alert>
                            )}

                            {iframeCode && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={iframeCode}
                                    variant="outlined"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                            )}

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ExportIcon />}
                                component={Link}
                                to={`/exports/create?gameId=${game.id}`}
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
                            component="a"
                            href={`/api/game-access/${game.id}`}
                            target="_blank"
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
                            {!game.questions || game.questions.length === 0 ? (
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
                                                        label="100 Puan"
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>
                                            }
                                        />

                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                aria-label="edit"
                                                component={Link}
                                                to={`/questions/${question.id}/edit`}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                color="error"
                                                onClick={() => handleDeleteClick(question.id)}
                                            >
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
                                component={Link}
                                to={`/games/${game.id}/settings`}
                                size="small"
                            >
                                Ayarları Düzenle
                            </Button>
                        </Box>

                        <Grid container spacing={3}>
                            {game.config ? (
                                Object.entries(game.config).map(([key, value]) => (
                                    <Grid item xs={12} sm={6} key={key}>
                                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Typography>
                                            <Typography variant="body1">
                                                {typeof value === 'boolean'
                                                    ? (value ? 'Evet' : 'Hayır')
                                                    : (String(value) || '-')
                                                }
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        Bu oyun için henüz özel ayar tanımlanmamış.
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>
                    </TabPanel>
                </Box>
            </Paper>

            {/* Silme Onay Dialogu */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Soruyu Oyundan Çıkar</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu soruyu oyundan çıkarmak istediğinize emin misiniz?
                    </DialogContentText>

                    {deleteError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={isDeleting}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} /> : null}
                    >
                        {isDeleting ? 'İşleniyor...' : 'Çıkar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GameDetail;