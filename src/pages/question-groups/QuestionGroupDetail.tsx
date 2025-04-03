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
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import * as questionGroupService from '../../services/question-group.service';

const QuestionGroupDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questionGroup, setQuestionGroup] = useState<questionGroupService.QuestionGroup | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [codeDialogOpen, setCodeDialogOpen] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    useEffect(() => {
        fetchQuestionGroup();
    }, [id]);

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
                        variant="outlined"
                        startIcon={<CopyIcon />}
                        onClick={handleCopyCodeClick}
                        sx={{ mr: 1 }}
                    >
                        Grup Kodu
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
                    Grup Bilgileri
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Grup Adı
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {questionGroup.name}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Grup Kodu
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
                <DialogTitle>Grup Kodu</DialogTitle>
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