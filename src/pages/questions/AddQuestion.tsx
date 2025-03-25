// src/pages/questions/AddQuestion.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Stepper, Step, StepLabel, Button,
    Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    TextField, Divider, Alert, MenuItem, Select, SelectChangeEvent
} from '@mui/material';

// Soru tipi seçenekleri
const questionTypes = [
    { value: 'multiple_choice', label: 'Çoktan Seçmeli' },
    { value: 'true_false', label: 'Doğru-Yanlış' },
    { value: 'qa', label: 'Klasik' }
];

// Zorluk seviyesi seçenekleri
const difficultyLevels = [
    { value: 'easy', label: 'Kolay' },
    { value: 'medium', label: 'Orta' },
    { value: 'hard', label: 'Zor' }
];

// Mock oyun verileri
const mockGames = [
    { id: 1, name: 'Tarih Bilgi Yarışması' },
    { id: 2, name: 'Fen Soruları' },
    { id: 3, name: 'Matematik Yarışması' },
    { id: 4, name: 'Genel Kültür' }
];

// Mock kategori verileri
const mockCategories = [
    { id: 1, name: 'Tarih - 8. Sınıf' },
    { id: 2, name: 'Fen Bilgisi - 6. Sınıf' },
    { id: 3, name: 'Matematik - 7. Sınıf' },
    { id: 4, name: 'Sosyal Bilgiler - 5. Sınıf' }
];

// Adımlar
const steps = ['Soru Tipi', 'Soru ve Cevap', 'Oyun Seçimi'];

// Şık verisi için tip tanımı
interface Choice {
    id: string;
    text: string;
    isCorrect: boolean;
}

const AddQuestion = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    // Form verileri
    const [questionType, setQuestionType] = useState<string>('');
    const [questionText, setQuestionText] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [categoryId, setCategoryId] = useState('');
    const [gameId, setGameId] = useState('');

    // Cevap verileri
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [trueOrFalse, setTrueOrFalse] = useState('true');
    const [choices, setChoices] = useState<Choice[]>([
        { id: 'A', text: '', isCorrect: false },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
    ]);

    // Adım kontrolü
    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    // Soru tipini değiştir
    const handleQuestionTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionType(event.target.value);
    };

    // Zorluk seviyesini değiştir
    const handleDifficultyChange = (event: SelectChangeEvent) => {
        setDifficulty(event.target.value);
    };

    // Kategori değiştir
    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategoryId(event.target.value);
    };

    // Oyun değiştir
    const handleGameChange = (event: SelectChangeEvent) => {
        setGameId(event.target.value);
    };

    // Doğru/Yanlış değiştir
    const handleTrueFalseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTrueOrFalse(event.target.value);
    };

    // Çoktan seçmeli şık değiştir
    const handleChoiceTextChange = (id: string, text: string) => {
        setChoices(choices.map(choice =>
            choice.id === id ? { ...choice, text } : choice
        ));
    };

    // Doğru şık seç
    const handleCorrectChoiceChange = (id: string) => {
        setChoices(choices.map(choice =>
            ({ ...choice, isCorrect: choice.id === id })
        ));
    };

    // Formu gönder
    const handleSubmit = () => {
        // Form verilerini hazırla
        const formData = {
            question_type: questionType,
            question_text: questionText,
            difficulty,
            category_id: parseInt(categoryId),
            game_id: parseInt(gameId),
            answers: getAnswersBasedOnType()
        };

        console.log('Form verileri:', formData);

        // Normalde burada API'ye post yapılır
        alert('Soru başarıyla eklendi.');
        navigate('/questions');
    };

    // Soru tipine göre cevapları düzenle
    const getAnswersBasedOnType = () => {
        switch (questionType) {
            case 'multiple_choice':
                return choices.map(choice => ({
                    answer_text: choice.text,
                    is_correct: choice.isCorrect
                }));
            case 'true_false':
                return [
                    { answer_text: 'Doğru', is_correct: trueOrFalse === 'true' },
                    { answer_text: 'Yanlış', is_correct: trueOrFalse === 'false' }
                ];
            case 'qa':
                return [{ answer_text: correctAnswer, is_correct: true }];
            default:
                return [];
        }
    };

    // İlk adım geçerli mi
    const isFirstStepValid = () => {
        return questionType !== '';
    };

    // İkinci adım geçerli mi
    const isSecondStepValid = () => {
        if (!questionText || !categoryId) return false;

        switch (questionType) {
            case 'multiple_choice':
                // Tüm şıkların doldurulduğunu ve bir doğru cevap seçildiğini kontrol et
                return choices.every(choice => choice.text.trim() !== '') &&
                    choices.some(choice => choice.isCorrect);
            case 'true_false':
                // True/false için her zaman geçerli
                return true;
            case 'qa':
                // Klasik sorular için cevap alanı doldurulmuş olmalı
                return correctAnswer.trim() !== '';
            default:
                return false;
        }
    };

    // Son adım geçerli mi
    const isThirdStepValid = () => {
        return gameId !== '';
    };

    // Adım içeriği
    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Eklemek istediğiniz soru tipini seçin
                        </Typography>

                        <FormControl component="fieldset">
                            <RadioGroup value={questionType} onChange={handleQuestionTypeChange}>
                                {questionTypes.map((type) => (
                                    <FormControlLabel
                                        key={type.value}
                                        value={type.value}
                                        control={<Radio />}
                                        label={type.label}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Soru Detaylarını Girin
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Soru Metni"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <FormLabel>Kategori</FormLabel>
                                    <Select
                                        value={categoryId}
                                        onChange={handleCategoryChange}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Kategori Seçin</MenuItem>
                                        {mockCategories.map((category) => (
                                            <MenuItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <FormLabel>Zorluk Seviyesi</FormLabel>
                                    <Select
                                        value={difficulty}
                                        onChange={handleDifficultyChange}
                                    >
                                        {difficultyLevels.map((level) => (
                                            <MenuItem key={level.value} value={level.value}>
                                                {level.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Cevap Bilgisi
                                </Typography>

                                {questionType === 'multiple_choice' && (
                                    <Grid container spacing={2}>
                                        {choices.map((choice) => (
                                            <Grid item xs={12} key={choice.id}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Radio
                                                        checked={choice.isCorrect}
                                                        onChange={() => handleCorrectChoiceChange(choice.id)}
                                                    />
                                                    <TextField
                                                        label={`${choice.id} Şıkkı`}
                                                        fullWidth
                                                        value={choice.text}
                                                        onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                                                        required
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}

                                {questionType === 'true_false' && (
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Doğru Cevap</FormLabel>
                                        <RadioGroup value={trueOrFalse} onChange={handleTrueFalseChange}>
                                            <FormControlLabel value="true" control={<Radio />} label="Doğru" />
                                            <FormControlLabel value="false" control={<Radio />} label="Yanlış" />
                                        </RadioGroup>
                                    </FormControl>
                                )}

                                {questionType === 'qa' && (
                                    <TextField
                                        label="Doğru Cevap"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={correctAnswer}
                                        onChange={(e) => setCorrectAnswer(e.target.value)}
                                        required
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Sorunun Ekleneceği Oyunu Seçin
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <Select
                                value={gameId}
                                onChange={handleGameChange}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Oyun Seçin</MenuItem>
                                {mockGames.map((game) => (
                                    <MenuItem key={game.id} value={game.id.toString()}>
                                        {game.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Soru seçtiğiniz oyuna eklenecektir. Bu işlem, oyunun içeriğini günceller.
                        </Alert>
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
            isThirdStepValid()
        ][activeStep];

        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    disabled={activeStep === 0}
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
                            disabled={!isStepValid}
                            sx={{
                                py: 1,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                        >
                            Tamamla
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!isStepValid}
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
                Yeni Soru Ekle
            </Typography>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box>
                    {getStepContent(activeStep)}
                    {getStepActions()}
                </Box>
            </Paper>
        </Box>
    );
};

export default AddQuestion;