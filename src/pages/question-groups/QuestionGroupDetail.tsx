// src/pages/question-groups/QuestionGroupDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, Grid, CircularProgress, Alert, List, ListItem, ListItemText,
    Chip, IconButton, Tooltip, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as CopyIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import * as questionGroupService from '../../services/question-group.service';
import { getExportById } from '../../services/export.service';
import { useExport } from '../../hooks/useExport';

const QuestionGroupDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questionGroup, setQuestionGroup] = useState<questionGroupService.QuestionGroup | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [codeDialogOpen, setCodeDialogOpen] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const { triggerExport, loading: exportLoading } = useExport();

    // Added states for export status handling
    const [exportStatus, setExportStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'done' | 'failed'>('idle');
    const [outputUrl, setOutputUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [exportId, setExportId] = useState<number | null>(null);

    useEffect(() => {
        fetchQuestionGroup();
    }, [id]);

    // Added effect to check export status when exportId changes
    useEffect(() => {
        if (exportId) {
            const checkExportStatus = async () => {
                try {
                    // Get export status using the existing service method
                    const exportData = await getExportById(Number(exportId));

                    // Backend'de 'done' frontend'de 'completed' olarak tanımlanmış
                    if (exportData.status === 'completed' || exportData.status === 'done') {
                        setExportStatus('completed');
                        // undefined değil null kullan
                        setOutputUrl(exportData.output_url || exportData.download_url || null);
                    } else if (exportData.status === 'failed') {
                        setExportStatus('failed');
                        // undefined değil null kullan
                        setErrorMessage(exportData.error_message || 'Export işlemi başarısız oldu.');
                    } else if (exportData.status === 'pending' || exportData.status === 'processing') {
                        setExportStatus(exportData.status);
                    }
                } catch (err) {
                    console.error('Error checking export status:', err);
                    setExportStatus('failed');
                    setErrorMessage('Export durumu kontrol edilirken bir hata oluştu.');
                }
            };

            setExportStatus('pending');
            checkExportStatus();
        }
    }, [exportId]);

    const fetchQuestionGroup = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const response = await questionGroupService.getQuestionGroup(parseInt(id));
            setQuestionGroup(response);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching question group:', err);
            setError('Soru grubu yüklenirken bir hata oluştu.');
            setLoading(false);
        }
    };

    // Silme işlemleri
    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!id) return;

        try {
            await questionGroupService.deleteQuestionGroup(parseInt(id));
            navigate('/question-groups');
        } catch (err) {
            console.error('Error deleting question group:', err);
            setError('Soru grubu silinirken bir hata oluştu.');
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    // Kod kopyalama
    const handleCopyCodeClick = () => {
        if (!questionGroup) return;
        setCodeDialogOpen(true);
        setCodeCopied(false);
    };

    const handleCopyCode = () => {
        if (!questionGroup) return;
        navigator.clipboard.writeText(questionGroup.code);
        setCodeCopied(true);
    };

    const handleExport = async () => {
        if (!questionGroup?.id || !questionGroup?.game?.id) return;

        try {
            // Reset export status
            setExportStatus('idle');
            setOutputUrl(null);
            setErrorMessage(null);

            const result = await triggerExport({
                question_group_id: questionGroup.id,
                game_id: questionGroup.game.id,
            });

            setExportId(result.id);

            // İlerlemeyi takip etmek için bilgi mesajı göster
            alert('Export başlatıldı! ID: ' + result.id);
        } catch (error) {
            setExportStatus('failed');
            setErrorMessage('Export işlemi başlatılırken bir hata oluştu.');
            alert('Export işlemi sırasında hata oluştu.');
            console.error(error);
        }
    };

    // Soru tipi etiketini getir
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 3 }}>
                {error}
            </Alert>
        );
    }

    if (!questionGroup) {
        return (
            <Alert severity="warning" sx={{ mt: 3 }}>
                Soru grubu bulunamadı.
            </Alert>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        component={Link}
                        to="/question-groups"
                        color="primary"
                        sx={{ mr: 1 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">
                        {questionGroup.name}
                    </Typography>
                </Box>

                <Box>
                    <Button
                        onClick={handleExport}
                        disabled={exportLoading || exportStatus === 'pending'}
                        variant="contained"
                        color="primary"
                        sx={{ mr: 1 }}
                    >
                        {exportLoading || exportStatus === 'pending' ? "Yükleniyor..." : "Export Et"}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<CopyIcon />}
                        onClick={handleCopyCodeClick}
                        sx={{ mr: 1 }}
                    >
                        Etkinlik Kodu
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        component={Link}
                        to={`/question-groups/${id}/edit`}
                        sx={{ mr: 1 }}
                    >
                        Düzenle
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteClick}
                    >
                        Sil
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Etkinlik Bilgileri
                </Typography>

                <Grid container spacing={3}>
                    {/* Etkinlik Görseli */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Etkinlik Görseli
                        </Typography>
                        <Box sx={{ mt: 1, mb: 2 }}>
                            {questionGroup.image_url ? (
                                <Box
                                    component="img"
                                    src={questionGroup.image_url}
                                    alt={questionGroup.name}
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        objectFit: 'contain',
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0'
                                    }}
                                />
                            ) : (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 1,
                                    p: 4,
                                    border: '1px dashed #cccccc'
                                }}>
                                    <ImageIcon sx={{ fontSize: 40, color: '#aaaaaa', mr: 2 }} />
                                    <Typography color="text.secondary">
                                        Bu etkinlik için görsel bulunmuyor
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Etkinlik
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {questionGroup.name}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Etkinlik Kodu
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                                {questionGroup.code}
                            </Typography>
                            <IconButton
                                size="small"
                                color="primary"
                                sx={{ ml: 1 }}
                                onClick={handleCopyCodeClick}
                            >
                                <CopyIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Soru Tipi
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {getQuestionTypeLabel(questionGroup.question_type)}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Oyun
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {questionGroup.game?.name || '-'}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Oluşturan
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {questionGroup.creator?.name || '-'}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Soru Sayısı
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {questionGroup.questions?.length || 0}
                        </Typography>
                    </Grid>

                    {/* Export Status Display */}
                    {exportStatus === 'completed' && outputUrl && (
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle2" color="success.main" sx={{ mb: 1, fontWeight: "bold" }}>
                                    Export işlemi tamamlandı!
                                </Typography>
                                <a href={outputUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <Button variant="outlined" color="success" fullWidth startIcon={<span role="img" aria-label="game">🎮</span>}>
                                        Oyunu Görüntüle
                                    </Button>
                                </a>
                            </Box>
                        </Grid>
                    )}

                    {exportStatus === 'pending' || exportStatus === 'processing' ? (
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
                                <CircularProgress size={20} sx={{ mr: 2 }} />
                                <Typography variant="subtitle2" color="primary.main">
                                    Export işlemi devam ediyor...
                                </Typography>
                            </Box>
                        </Grid>
                    ) : null}

                    {exportStatus === 'failed' && errorMessage && (
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#fef6f6', borderRadius: 1, border: '1px solid #f5c2c2' }}>
                                <Typography variant="subtitle2" color="error.main" sx={{ mb: 1, fontWeight: "bold" }}>
                                    Export başarısız oldu
                                </Typography>
                                <Typography variant="body2" color="error.main">
                                    {errorMessage}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Sorular
                </Typography>

                {questionGroup.questions && questionGroup.questions.length > 0 ? (
                    <List
                        sx={{
                            width: '100%',
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                            maxHeight: '500px',
                            overflow: 'auto'
                        }}
                    >
                        {questionGroup.questions.map((question, index) => (
                            <ListItem
                                key={question.id}
                                sx={{
                                    borderBottom: '1px solid #f0f0f0',
                                    '&:last-child': { borderBottom: 'none' }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ mr: 1, minWidth: '30px' }}>
                                                {index + 1}.
                                            </Typography>
                                            {question.question_text}
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', mt: 1 }}>
                                            {question.category && (
                                                <Chip
                                                    label={question.category.name}
                                                    size="small"
                                                    color="default"
                                                    sx={{ mr: 1 }}
                                                />
                                            )}
                                            <Chip
                                                label={question.difficulty === 'easy' ? 'Kolay' :
                                                    question.difficulty === 'medium' ? 'Orta' : 'Zor'}
                                                size="small"
                                                color={
                                                    question.difficulty === 'easy' ? 'success' :
                                                        question.difficulty === 'medium' ? 'warning' : 'error'
                                                }
                                            />
                                        </Box>
                                    }
                                />

                                <Tooltip title="Soruyu Görüntüle">
                                    <IconButton
                                        size="small"
                                        component={Link}
                                        to={`/questions/${question.id}`}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Alert severity="info">
                        Bu grupta henüz soru bulunmuyor.
                    </Alert>
                )}
            </Paper>

            {/* Silme Onay Dialogu */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Soru Grubunu Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{questionGroup.name}" soru grubunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Kod Gösterme Dialogu */}
            <Dialog
                open={codeDialogOpen}
                onClose={() => setCodeDialogOpen(false)}
            >
                <DialogTitle>Etkinlik Kodu</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu gruptan soruları çekmek için aşağıdaki kodu kullanabilirsiniz:
                    </DialogContentText>
                    <Box sx={{
                        my: 2,
                        p: 2,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '16px'
                    }}>
                        {questionGroup.code}
                    </Box>
                    {codeCopied && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Kod panoya kopyalandı!
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCodeDialogOpen(false)}>
                        Kapat
                    </Button>
                    <Button
                        onClick={handleCopyCode}
                        variant="contained"
                        startIcon={<CopyIcon />}
                    >
                        Kopyala
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionGroupDetail;