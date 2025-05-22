// src/pages/questions/AddQuestion.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Stepper, Step, StepLabel, Button,
    Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    TextField, Divider, Alert, MenuItem, Select, SelectChangeEvent,
    CircularProgress, InputLabel
} from '@mui/material';
import { useEducationStructure } from '../../hooks/useEducationStructure';
import * as questionService from '../../services/question.service';
import * as gameService from '../../services/game.service';
import axios, { AxiosError } from 'axios';
import { useCategories } from '../../hooks/useCategories';
import ImageUploader from '../../components/ImageUploader';

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

// Adımlar - Oyun Seçimi adımını kaldırdık
const steps = ['Soru Tipi', 'Soru ve Cevap'];

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

const AddQuestion = () => {
    const navigate = useNavigate();
    const params = useParams();
    const isEdit = !!params.id;
    const questionId = params.id ? parseInt(params.id) : undefined;

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { grades, subjects, units, topics } = useEducationStructure();
    // Kategorileri yükle
    const { categories } = useCategories();

    // Form verileri
    const [questionType, setQuestionType] = useState<string>('');
    const [questionText, setQuestionText] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [categoryId, setCategoryId] = useState<number | ''>('');

    // Kategori seçimi için state'ler
    const [gradeId, setGradeId] = useState<number | ''>('');
    const [subjectId, setSubjectId] = useState<number | ''>('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [topicId, setTopicId] = useState<number | ''>('');

    // Resim yükleme için state'ler
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    // Cevap verileri
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [trueOrFalse, setTrueOrFalse] = useState('true');
    const [choices, setChoices] = useState([
        { id: 'A', text: '', isCorrect: false },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
    ]);

    // Kategori değiştiğinde ilgili bilgileri otomatik doldur
    useEffect(() => {
        if (categoryId) {
            const selectedCategory = categories.find(c => c.id === categoryId);
            if (selectedCategory) {
                setGradeId(selectedCategory.grade_id);
                setSubjectId(selectedCategory.subject_id);
                setUnitId(selectedCategory.unit_id ?? '');
                setTopicId(selectedCategory.topic_id ?? '');
            }
        } else {
            // Kategori seçilmediğinde alanları temizle
            setGradeId('');
            setSubjectId('');
            setUnitId('');
            setTopicId('');
        }
    }, [categoryId, categories]);

    // Düzenleme durumunda soruyu yükle
    useEffect(() => {
        const fetchQuestion = async () => {
            if (isEdit && questionId) {
                try {
                    setLoading(true);
                    const question = await questionService.getQuestion(questionId);

                    // Form verilerini doldur
                    setQuestionType(question.question_type);
                    setQuestionText(question.question_text);
                    setDifficulty(question.difficulty);
                    setCategoryId(question.category_id);

                    // Resim yolunu ayarla
                    if (question.image_path) {
                        setImagePath(question.image_path);
                    }

                    // Cevapları doldur
                    if (question.question_type === 'multiple_choice') {
                        const updatedChoices = [...choices];
                        question.answers.forEach((answer, index) => {
                            if (index < updatedChoices.length) {
                                updatedChoices[index].text = answer.answer_text;
                                updatedChoices[index].isCorrect = answer.is_correct;
                            }
                        });
                        setChoices(updatedChoices);
                    } else if (question.question_type === 'true_false') {
                        const trueAnswer = question.answers.find(a => a.is_correct);
                        setTrueOrFalse(trueAnswer?.answer_text.toLowerCase() === 'doğru' ? 'true' : 'false');
                    } else if (question.question_type === 'qa') {
                        const correctAns = question.answers.find(a => a.is_correct);
                        if (correctAns) {
                            setCorrectAnswer(correctAns.answer_text);
                        }
                    }

                    setLoading(false);

                    // Düzenleme modunda ilk adım tipi zaten seçili olduğu için 2. adıma geç
                    setActiveStep(1);
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        const axiosError = error as AxiosError<ApiErrorResponse>;
                        setError(axiosError.response?.data?.message || 'Soru yüklenirken bir hata oluştu');
                        console.error('Error fetching question:', axiosError.response?.data);
                    } else {
                        setError('Soru yüklenirken beklenmeyen bir hata oluştu');
                        console.error('Unexpected error:', error);
                    }
                    setLoading(false);
                }
            }
        };

        fetchQuestion();
    }, [isEdit, questionId]);

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
    const handleCategoryChange = (event: SelectChangeEvent<number | ''>) => {
        setCategoryId(event.target.value as number | '');
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

    // Resim yolunu değiştir (ImageUploader bileşeninden gelen callback)
    const handleImagePathChange = (path: string | null) => {
        setImagePath(path);
    };

    // Formu gönder - Tüm oyunlara otomatik soru ekleme ile güncellenmiş
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Kategori ID kontrol et
            if (!categoryId) {
                setError('Lütfen geçerli bir kategori seçin');
                setLoading(false);
                return;
            }

            // Soru tipine göre cevapları hazırla
            const answers = getAnswersBasedOnType();

            // QuestionCreate için veri oluştur
            const questionData: questionService.QuestionCreate = {
                category_id: categoryId as number,
                question_text: questionText,
                question_type: questionType as 'multiple_choice' | 'true_false' | 'qa',
                difficulty: difficulty as 'easy' | 'medium' | 'hard',
                answers,
                image_path: imagePath
            };

            console.log("Gönderilen veri:", questionData);

            let question;

            // Yeni soru mu, düzenleme mi?
            if (isEdit && questionId) {
                question = await questionService.updateQuestion(questionId, questionData);
            } else {
                question = await questionService.createQuestion(questionData);
            }

            // Soru başarıyla oluşturuldu/güncellendi, şimdi tüm oyunlara ekleyelim
            if (question && !isEdit) { // Sadece yeni soru ekleme durumunda oyunlara ekle
                try {
                    // Tüm oyunları getir
                    const gamesResponse = await gameService.getGames(1);
                    const games = gamesResponse.data;

                    // Her oyuna soruyu ekle
                    for (const game of games) {
                        await gameService.addQuestionToGame(game.id, {
                            question_id: question.id,
                            points: 100 // Varsayılan puan
                        });
                    }

                    console.log(`Soru ${games.length} oyuna başarıyla eklendi`);
                } catch (error) {
                    console.error('Soru oyunlara eklenirken hata oluştu:', error);
                    // Oyunlara ekleme hatası oluşsa bile kullanıcıya gösterme, çünkü soru zaten başarıyla oluşturuldu
                }
            }

            // Kullanıcıya herhangi bir bildirim göstermeden doğrudan soru listesine yönlendir
            navigate('/questions');

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                setError(axiosError.response?.data?.message || (isEdit ? 'Soru güncellenirken bir hata oluştu' : 'Soru eklenirken bir hata oluştu'));
                console.error('Error submitting question:', axiosError.response?.data);
            } else {
                setError(isEdit ? 'Soru güncellenirken beklenmeyen bir hata oluştu' : 'Soru eklenirken beklenmeyen bir hata oluştu');
                console.error('Unexpected error:', error);
            }
        } finally {
            setLoading(false);
        }
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

    // Adım içeriği
    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{
                        width: '100%',
                        px: 3,
                        boxSizing: 'border-box'
                    }}>
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
                    <Box sx={{
                        width: '100%',
                        px: 2,
                        boxSizing: 'border-box'
                    }}>
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

                            {/* ImageUploader bileşeni */}
                            <Grid item xs={12}>
                                <ImageUploader
                                    imagePath={imagePath}
                                    onImagePathChange={handleImagePathChange}
                                    onError={setImageError}
                                />

                                {imageError && (
                                    <Alert severity="error" sx={{ mt: 1 }}>
                                        {imageError}
                                    </Alert>
                                )}
                            </Grid>

                            {/* Kategori Seçimi - edit modunda disabled */}
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Kategori</InputLabel>
                                    <Select
                                        value={categoryId}
                                        label="Kategori"
                                        onChange={handleCategoryChange}
                                        required
                                        disabled={isEdit} // Edit modunda değiştirilemesin
                                    >
                                        <MenuItem value="" disabled>Kategori Seçin</MenuItem>
                                        {categories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Otomatik doldurulan ve seçilemeyen alanlar */}
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth disabled>
                                    <InputLabel>Sınıf</InputLabel>
                                    <Select
                                        value={gradeId}
                                        label="Sınıf"
                                    >
                                        {grades.map((grade) => (
                                            <MenuItem key={grade.id} value={grade.id}>
                                                {grade.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth disabled>
                                    <InputLabel>Ders</InputLabel>
                                    <Select
                                        value={subjectId}
                                        label="Ders"
                                    >
                                        {subjects.map((subject) => (
                                            <MenuItem key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth disabled>
                                    <InputLabel>Ünite</InputLabel>
                                    <Select
                                        value={unitId}
                                        label="Ünite"
                                    >
                                        {units.map((unit) => (
                                            <MenuItem key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth disabled>
                                    <InputLabel>Konu</InputLabel>
                                    <Select
                                        value={topicId}
                                        label="Konu"
                                    >
                                        {topics.map((topic) => (
                                            <MenuItem key={topic.id} value={topic.id}>
                                                {topic.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Zorluk Seviyesi</InputLabel>
                                    <Select
                                        value={difficulty}
                                        label="Zorluk Seviyesi"
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

            default:
                return 'Bilinmeyen adım';
        }
    };

    // Adım butonlarının durumu
    const getStepActions = () => {
        const isStepValid = [
            isFirstStepValid(),
            isSecondStepValid()
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
                            {loading ? 'İşleniyor...' : (isEdit ? 'Güncelle' : 'Tamamla')}
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
        <Box sx={{
            width: '100%',
            px: 3,
            boxSizing: 'border-box'
        }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                {isEdit ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
            </Typography>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                {loading && activeStep === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
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
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default AddQuestion;