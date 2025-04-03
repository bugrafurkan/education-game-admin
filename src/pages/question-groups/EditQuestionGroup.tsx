// src/pages/question-groups/EditQuestionGroup.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, TextField,
    Grid, List, ListItem, ListItemText, Checkbox,
    ListItemIcon, Alert, CircularProgress, Chip,
    Pagination, FormHelperText, IconButton
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import * as questionGroupService from '../../services/question-group.service';

const EditQuestionGroup = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Form verileri
    const [name, setName] = useState('');
    const [questionType, setQuestionType] = useState<string>('');
    const [gameId, setGameId] = useState<number>(0);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    // Liste verileri
    const [eligibleQuestions, setEligibleQuestions] = useState<questionGroupService.Question[]>([]);
    const [allGroupQuestions, setAllGroupQuestions] = useState<questionGroupService.Question[]>([]);

    // Durum
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questionsPage, setQuestionsPage] = useState(1);
    const [totalQuestionsPages, setTotalQuestionsPages] = useState(1);

    // Grup verilerini yükle
    useEffect(() => {
        if (!id) return;
        fetchQuestionGroup();
    }, [id]);

    const fetchQuestionGroup = async () => {
        try {
            setLoading(true);
            const response = await questionGroupService.getQuestionGroup(parseInt(id!));

            // Form verilerini doldur
            setName(response.name);
            setQuestionType(response.question_type);
            setGameId(response.game_id);
            setAllGroupQuestions(response.questions || []);
            setSelectedQuestions(response.questions?.map(q => q.id) || []);

            setLoading(false);

            // Uygun soruları yükle
            fetchEligibleQuestions();
        } catch (err) {
            console.error('Error fetching question group:', err);
            setError('Soru grubu yüklenirken bir hata oluştu.');
            setLoading(false);
        }
    };

    // Uygun soruları yükle
    useEffect(() => {
        if (!loading && gameId && questionType) {
            fetchEligibleQuestions();
        }
    }, [loading, questionsPage, gameId, questionType]);

    const fetchEligibleQuestions = async () => {
        try {
            setQuestionsLoading(true);
            const response = await questionGroupService.getEligibleQuestions({
                game_id: gameId,
                question_type: questionType as 'multiple_choice' | 'true_false' | 'qa',
                page: questionsPage
            });
            setEligibleQuestions(response.data);
            setTotalQuestionsPages(response.last_page);
            setQuestionsLoading(false);
        } catch (err) {
            console.error('Error fetching eligible questions:', err);
            setError('Sorular yüklenirken bir hata oluştu.');
            setQuestionsLoading(false);
        }
    };

    // Soru seçimi
    const handleQuestionToggle = (questionId: number) => {
        const currentIndex = selectedQuestions.indexOf(questionId);
        const newSelectedQuestions = [...selectedQuestions];

        if (currentIndex === -1) {
            // Seçilecek soru sayısı limitini kontrol et
            if (newSelectedQuestions.length >= 48) {
                setError('En fazla 48 soru seçebilirsiniz.');
                return;
            }
            newSelectedQuestions.push(questionId);
        } else {
            newSelectedQuestions.splice(currentIndex, 1);
        }

        setSelectedQuestions(newSelectedQuestions);
        setError(null);
    };

    // Form gönderme
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);

            // Soru sayısını kontrol et
            if (selectedQuestions.length < 16) {
                setError('En az 16 soru seçmelisiniz.');
                setSaving(false);
                return;
            }

            if (selectedQuestions.length > 48) {
                setError('En fazla 48 soru seçebilirsiniz.');
                setSaving(false);
                return;
            }

            // Grup güncelle
            const groupData: questionGroupService.QuestionGroupUpdate = {
                name,
                question_ids: selectedQuestions
            };

            await questionGroupService.updateQuestionGroup(parseInt(id!), groupData);

            // Başarılı mesajı göster
            alert('Soru grubu başarıyla güncellendi.');

            // Grup detay sayfasına yönlendir
            navigate(`/question-groups/${id}`);
        } catch (err) {
            console.error('Error updating question group:', err);
            setError('Soru grubu güncellenirken bir hata oluştu.');
        } finally {
            setSaving(false);
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

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        component={Link}
                        to={`/question-groups/${id}`}
                        color="primary"
                        sx={{ mr: 1 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">
                        Soru Grubunu Düzenle
                    </Typography>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Grup Bilgileri
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Grup Adı"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Soru Tipi"
                                fullWidth
                                value={getQuestionTypeLabel(questionType)}
                                InputProps={{
                                    readOnly: true,
                                }}
                                disabled
                                helperText="Soru tipi değiştirilemez"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Oyun"
                                fullWidth
                                value={gameId}
                                InputProps={{
                                    readOnly: true,
                                }}
                                disabled
                                helperText="Oyun değiştirilemez"
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">
                            Soruları Seçin
                        </Typography>

                        <Chip
                            label={`Seçili: ${selectedQuestions.length}/48`}
                            color={
                                selectedQuestions.length < 16 ? "error" :
                                    selectedQuestions.length <= 48 ? "success" : "error"
                            }
                        />
                    </Box>

                    <FormHelperText sx={{ mb: 2 }}>
                        Not: En az 16, en fazla 48 soru seçmelisiniz.
                    </FormHelperText>

                    {questionsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : eligibleQuestions.length === 0 ? (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            Bu oyunda seçilen tipteki sorular bulunamadı.
                        </Alert>
                    ) : (
                        <>
                            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                {eligibleQuestions.map((question) => {
                                    const isSelected = selectedQuestions.indexOf(question.id) !== -1;
                                    const isOriginallyInGroup = allGroupQuestions.some(q => q.id === question.id);

                                    return (
                                        <ListItem
                                            key={question.id}
                                            dense
                                            onClick={() => handleQuestionToggle(question.id)}
                                            sx={{
                                                borderBottom: '1px solid #f0f0f0',
                                                '&:last-child': { borderBottom: 'none' },
                                                bgcolor: isOriginallyInGroup ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={isSelected}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={question.question_text}
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                                                            {question.category?.name}
                                                        </Typography>
                                                        {isOriginallyInGroup && (
                                                            <Chip
                                                                label="Mevcut"
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>

                            {totalQuestionsPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Pagination
                                        count={totalQuestionsPages}
                                        page={questionsPage}
                                        onChange={(_, page) => setQuestionsPage(page)}
                                        color="primary"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        component={Link}
                        to={`/question-groups/${id}`}
                        variant="outlined"
                        sx={{ mr: 2 }}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={saving || name.trim() === '' || selectedQuestions.length < 16 || selectedQuestions.length > 48}
                        sx={{
                            py: 1.5,
                            px: 3,
                            bgcolor: '#1a1a27',
                            '&:hover': { bgcolor: '#2a2a37' }
                        }}
                    >
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default EditQuestionGroup;