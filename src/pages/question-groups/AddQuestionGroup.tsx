// src/pages/question-groups/AddQuestionGroup.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Stepper, Step, StepLabel, Button,
    Grid, TextField, FormControl, InputLabel, Select, MenuItem,
    SelectChangeEvent, Divider, Alert, CircularProgress, List,
    ListItem, ListItemText, Checkbox, ListItemIcon, Pagination,
    FormHelperText, Chip
} from '@mui/material';
import * as questionGroupService from '../../services/question-group.service';
import * as gameService from '../../services/game.service';

const steps = ['Grup Bilgileri', 'Soru Seçimi', 'Önizleme'];

const AddQuestionGroup = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    // Form verileri
    const [name, setName] = useState('');
    const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false' | 'qa'>('multiple_choice');
    const [gameId, setGameId] = useState<string>('');
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    // Liste verileri
    const [games, setGames] = useState<gameService.Game[]>([]);
    const [eligibleQuestions, setEligibleQuestions] = useState<questionGroupService.Question[]>([]);

    // Durum
    const [loading, setLoading] = useState(false);
    const [gamesLoading, setGamesLoading] = useState(false);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questionsPage, setQuestionsPage] = useState(1);
    const [totalQuestionsPages, setTotalQuestionsPages] = useState(1);

    // Oyunları yükle
    useEffect(() => {
        const fetchGames = async () => {
            try {
                setGamesLoading(true);
                const response = await gameService.getGames(1);
                setGames(response.data);
                setGamesLoading(false);
            } catch (err) {
                console.error('Error fetching games:', err);
                setError('Oyunlar yüklenirken bir hata oluştu.');
                setGamesLoading(false);
            }
        };

        fetchGames();
    }, []);

    // Seçilen oyun ve soru tipine göre uygun soruları yükle
    useEffect(() => {
        if (activeStep === 1 && gameId && questionType) {
            fetchEligibleQuestions();
        }
    }, [activeStep, gameId, questionType, questionsPage]);

    const fetchEligibleQuestions = async () => {
        try {
            setQuestionsLoading(true);
            const response = await questionGroupService.getEligibleQuestions({
                game_id: parseInt(gameId),
                question_type: questionType,
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

    // Adım kontrolü
    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    // Form alanları değişimleri
    const handleQuestionTypeChange = (event: SelectChangeEvent) => {
        setQuestionType(event.target.value as 'multiple_choice' | 'true_false' | 'qa');
        setSelectedQuestions([]); // Tip değiştiğinde seçili soruları sıfırla
    };

    const handleGameChange = (event: SelectChangeEvent) => {
        setGameId(event.target.value);
        setSelectedQuestions([]); // Oyun değiştiğinde seçili soruları sıfırla
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
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Soru sayısını kontrol et
            if (selectedQuestions.length < 16) {
                setError('En az 16 soru seçmelisiniz.');
                setLoading(false);
                return;
            }

            if (selectedQuestions.length > 48) {
                setError('En fazla 48 soru seçebilirsiniz.');
                setLoading(false);
                return;
            }

            // Grup oluştur
            const groupData: questionGroupService.QuestionGroupCreate = {
                name,
                question_type: questionType,
                game_id: parseInt(gameId),
                question_ids: selectedQuestions
            };

            await questionGroupService.createQuestionGroup(groupData);

            // Başarılı mesajı göster
            alert('Soru grubu başarıyla oluşturuldu.');

            // Soru grupları listesine yönlendir
            navigate('/question-groups');
        } catch (err) {
            console.error('Error creating question group:', err);
            setError('Soru grubu oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
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

    // Adım geçerlilik kontrolleri
    const isFirstStepValid = () => {
        return name.trim() !== '' && gameId !== '';
    };

    const isSecondStepValid = () => {
        return selectedQuestions.length >= 16 && selectedQuestions.length <= 48;
    };

    // Adım içeriği
    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Grup Bilgilerini Girin
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
                                <FormControl fullWidth>
                                    <InputLabel>Soru Tipi</InputLabel>
                                    <Select
                                        value={questionType}
                                        label="Soru Tipi"
                                        onChange={handleQuestionTypeChange}
                                    >
                                        <MenuItem value="multiple_choice">Çoktan Seçmeli</MenuItem>
                                        <MenuItem value="true_false">Doğru-Yanlış</MenuItem>
                                        <MenuItem value="qa">Klasik</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Oyun</InputLabel>
                                    <Select
                                        value={gameId}
                                        label="Oyun"
                                        onChange={handleGameChange}
                                        disabled={gamesLoading}
                                    >
                                        {gamesLoading ? (
                                            <MenuItem value="" disabled>Yükleniyor...</MenuItem>
                                        ) : (
                                            games.map((game) => (
                                                <MenuItem key={game.id} value={game.id.toString()}>
                                                    {game.name} ({game.type === 'jeopardy' ? 'Jeopardy' : 'Bilgi Çarkı'})
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Soruları Seçin
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                {getQuestionTypeLabel(questionType)} tipindeki sorulardan seçim yapabilirsiniz.
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
                                Bu oyunda seçilen tipteki sorular bulunamadı. Lütfen önce soru ekleyin veya başka bir oyun/tip seçin.
                            </Alert>
                        ) : (
                            <>
                                <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                    {eligibleQuestions.map((question) => {
                                        const isSelected = selectedQuestions.indexOf(question.id) !== -1;

                                        return (
                                            <ListItem
                                                key={question.id}
                                                dense
                                                onClick={() => handleQuestionToggle(question.id)}
                                                sx={{
                                                    borderBottom: '1px solid #f0f0f0',
                                                    '&:last-child': { borderBottom: 'none' },
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
                                                    secondary={question.category?.name}
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
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Soru Grubu Önizleme
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Grup Adı:
                                </Typography>
                                <Typography>{name}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Soru Tipi:
                                </Typography>
                                <Typography>{getQuestionTypeLabel(questionType)}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Oyun:
                                </Typography>
                                <Typography>
                                    {games.find(g => g.id.toString() === gameId)?.name || '-'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Soru Sayısı:
                                </Typography>
                                <Typography>
                                    {selectedQuestions.length}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                    Seçilen Sorular:
                                </Typography>

                                <List sx={{
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    borderRadius: 1,
                                    border: '1px solid #e0e0e0',
                                    maxHeight: '300px',
                                    overflow: 'auto'
                                }}>
                                    {selectedQuestions.map((questionId, index) => {
                                        const question = eligibleQuestions.find(q => q.id === questionId) ||
                                            { id: questionId, question_text: `Soru #${questionId}`, category: { name: '-' } };

                                        return (
                                            <ListItem
                                                key={questionId}
                                                dense
                                                sx={{
                                                    borderBottom: '1px solid #f0f0f0',
                                                    '&:last-child': { borderBottom: 'none' }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={`${index + 1}. ${question.question_text}`}
                                                    secondary={question.category?.name}
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Grid>
                        </Grid>
                    </Box>
                );

            default:
                return 'Bilinmeyen adım';
        }
    };

    // Adım butonlarının durumu
    const getStepActions = () => {
        const isStepValid = [
            isFirstStepValid(),
            isSecondStepValid(),
            true // Son adım her zaman geçerli
        ][activeStep];

        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    disabled={activeStep === 0 || loading}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                >
                    Geri
                </Button>
                <Box>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{
                                py: 1,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            {loading ? 'İşleniyor...' : 'Grubu Oluştur'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!isStepValid || loading}
                            sx={{
                                py: 1,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                        >
                            İleri
                        </Button>
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Yeni Soru Grubu Oluştur
            </Typography>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box>
                    {getStepContent(activeStep)}
                    {getStepActions()}
                </Box>
            </Paper>
        </Box>
    );
};

export default AddQuestionGroup;