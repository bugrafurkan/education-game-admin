// src/pages/questions/AddQuestion.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Stepper, Step, StepLabel, Button,
    Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    TextField, Divider, Alert, MenuItem, Select, SelectChangeEvent,
    CircularProgress
} from '@mui/material';
import { useCategories } from '../../hooks/useCategories';
import * as questionService from '../../services/question.service';
import * as gameService from '../../services/game.service';
import axios, { AxiosError } from 'axios';

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

// Adımlar
const steps = ['Soru Tipi', 'Soru ve Cevap', 'Oyun Seçimi'];

// URL'den query parametresi alma fonksiyonu
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

const AddQuestion = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const params = useParams();
    const isEdit = !!params.id;
    const questionId = params.id ? parseInt(params.id) : undefined;
    const gameIdFromUrl = query.get('gameId');

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form verileri
    const [questionType, setQuestionType] = useState<string>('');
    const [questionText, setQuestionText] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [categoryId, setCategoryId] = useState('');
    const [gameId, setGameId] = useState(gameIdFromUrl || '');

    // Resim yükleme için state'ler
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
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

    // Oyun listesi
    const [games, setGames] = useState<gameService.Game[]>([]);
    const [gamesLoading, setGamesLoading] = useState(false);

    // Kategori hook'u
    const { categories, loading: categoriesLoading } = useCategories();

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
                    setCategoryId(question.category_id.toString());

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
    }, [isEdit, questionId,choices]);

    // Oyun listesini yükle
    useEffect(() => {
        const fetchGames = async () => {
            try {
                setGamesLoading(true);
                const response = await gameService.getGames(1);
                setGames(response.data);
                setGamesLoading(false);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<ApiErrorResponse>;
                    setError(axiosError.response?.data?.message || 'Oyunlar yüklenirken bir hata oluştu');
                    console.error('Error fetching games:', axiosError.response?.data);
                } else {
                    setError('Oyunlar yüklenirken beklenmeyen bir hata oluştu');
                    console.error('Unexpected error:', error);
                }
                setGamesLoading(false);
            }
        };

        // 3. adıma geldiğimizde oyunları yükle
        if (activeStep === 2) {
            fetchGames();
        }
    }, [activeStep]);

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

    // Resim yükleme fonksiyonu
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Dosya boyutu kontrolü (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setImageError("Dosya boyutu 2MB'dan küçük olmalıdır.");
            return;
        }

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
            setImageError("Sadece resim dosyaları yüklenebilir.");
            return;
        }

        setImageFile(file);
        setImageError(null);

        // Önizleme URL'i oluştur
        const objectUrl = URL.createObjectURL(file);
        setImagePath(objectUrl);
    };

    // Resmi kaldırma fonksiyonu
    const handleRemoveImage = () => {
        setImagePath(null);
        setImageFile(null);
    };

    // Formu gönder
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Soru tipine göre cevapları hazırla
            const answers = getAnswersBasedOnType();

            // QuestionCreate için veri oluştur
            const questionData: questionService.QuestionCreate = {
                category_id: parseInt(categoryId),
                question_text: questionText,
                question_type: questionType as 'multiple_choice' | 'true_false' | 'qa',
                difficulty: difficulty as 'easy' | 'medium' | 'hard',
                answers
            };

            // Resim dosyası varsa, önce onu yükle
            if (imageFile) {
                setImageLoading(true);
                try {
                    const uploadResponse = await questionService.uploadImage(imageFile);
                    questionData.image_path = uploadResponse.url;
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        const axiosError = error as AxiosError<ApiErrorResponse>;
                        setImageError(axiosError.response?.data?.message || 'Resim yüklenirken bir hata oluştu');
                        console.error('Error uploading image:', axiosError.response?.data);
                    } else {
                        setImageError('Resim yüklenirken beklenmeyen bir hata oluştu');
                        console.error('Unexpected image upload error:', error);
                    }
                    setLoading(false);
                    setImageLoading(false);
                    return; // Hata varsa formu göndermeyi durdur
                }
                setImageLoading(false);
            } else if (imagePath && isEdit) {
                // Düzenleme sırasında mevcut resim yolu
                questionData.image_path = imagePath;
            }

            let question;

            // Yeni soru mu, düzenleme mi?
            if (isEdit && questionId) {
                question = await questionService.updateQuestion(questionId, questionData);
            } else {
                question = await questionService.createQuestion(questionData);
            }

            // Eğer oyun seçildiyse, soruyu oyuna ekle
            if (gameId && question) {
                await gameService.addQuestionToGame(parseInt(gameId), {
                    question_id: question.id,
                    points: 100 // Varsayılan puan
                });
            }

            // Başarılı mesajı göster
            alert(isEdit ? 'Soru başarıyla güncellendi.' : 'Soru başarıyla eklendi.');

            // Soru listesine yönlendir
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

    // Son adım geçerli mi
    const isThirdStepValid = () => {
        // Oyun seçimi opsiyonel olabilir
        return true;
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

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Soru Resmi (Opsiyonel)
                                </Typography>

                                {imagePath && (
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
                                            onClick={handleRemoveImage}
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
                                )}

                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{ mr: 2 }}
                                >
                                    Resim Seç
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageUpload}
                                    />
                                </Button>

                                {imageLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}

                                {imageError && (
                                    <Alert severity="error" sx={{ mt: 1 }}>
                                        {imageError}
                                    </Alert>
                                )}
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
                                        {categoriesLoading ? (
                                            <MenuItem value="" disabled>Yükleniyor...</MenuItem>
                                        ) : (
                                            categories.map((category) => (
                                                <MenuItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </MenuItem>
                                            ))
                                        )}
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
                                <MenuItem value="">Oyun Seçin (Opsiyonel)</MenuItem>
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

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Soru seçtiğiniz oyuna eklenecektir. Bu adımı atlarsanız, soruyu daha sonra bir oyuna ekleyebilirsiniz.
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
        <Box>
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