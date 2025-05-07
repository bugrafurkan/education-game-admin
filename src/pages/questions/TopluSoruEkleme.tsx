// src/pages/questions/TopluSoruEkleme.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, TextField, FormControl,
    RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem,
    Divider, IconButton, Alert, CircularProgress,
    Tooltip, Fab, Dialog, DialogActions, DialogContent,
    DialogTitle, DialogContentText, Accordion, AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Add as AddIcon,
    Save as SaveIcon,
    RemoveCircleOutline as RemoveIcon,
    ExpandMore as ExpandMoreIcon,
    FileCopy as FileCopyIcon
} from '@mui/icons-material';
import { useEducationStructure } from '../../hooks/useEducationStructure';
import { useCategories } from '../../hooks/useCategories';
import * as questionService from '../../services/question.service';
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

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

// Boş seçenek şablonu
const emptyChoiceTemplate = [
    { id: 'A', text: '', isCorrect: false },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false }
];

// Boş soru şablonu
interface QuestionTemplate {
    id: number;
    questionText: string;
    imageFile: File | null;
    imagePath: string | null;
    difficulty: string;
    correctAnswer: string;
    trueOrFalse: string;
    choices: {
        id: string;
        text: string;
        isCorrect: boolean;
    }[];
    expanded: boolean;
    valid: boolean;
    error: string | null;
}

const TopluSoruEkleme = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Genel ayarlar
    const [questionType, setQuestionType] = useState<string>('');
    const [categoryId, setCategoryId] = useState<number | ''>('');

    // Kategori ile ilgili otomatik doldurulan alanlar
    const [gradeId, setGradeId] = useState<number | ''>('');
    const [subjectId, setSubjectId] = useState<number | ''>('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [topicId, setTopicId] = useState<number | ''>('');

    // Soru listesi ve sayacı
    const [questions, setQuestions] = useState<QuestionTemplate[]>([]);
    const [questionCounter, setQuestionCounter] = useState(1);

    // Dialog kontrolleri
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [navigateAfterSave, setNavigateAfterSave] = useState(false);

    // Eğitim yapısı ve kategorileri yükle
    const { grades, subjects, units, topics } = useEducationStructure();
    const { categories } = useCategories();

    // Kategori değiştiğinde ilgili alanları otomatik güncelle
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
            setGradeId('');
            setSubjectId('');
            setUnitId('');
            setTopicId('');
        }
    }, [categoryId, categories]);

    // Soru tipi veya kategori değiştiğinde tüm soruları temizle
    useEffect(() => {
        if (questions.length > 0) {
            setConfirmDialogOpen(true);
        }
    }, [questionType, categoryId]);

    // Yeni soru ekle
    const handleAddQuestion = () => {
        const newQuestion: QuestionTemplate = {
            id: questionCounter,
            questionText: '',
            imageFile: null,
            imagePath: null,
            difficulty: 'medium',
            correctAnswer: '',
            trueOrFalse: 'true',
            choices: JSON.parse(JSON.stringify(emptyChoiceTemplate)),
            expanded: true,
            valid: false,
            error: null
        };

        setQuestions([...questions, newQuestion]);
        setQuestionCounter(questionCounter + 1);
    };

    // Soru kopyala
    const handleDuplicateQuestion = (questionIndex: number) => {
        const questionToDuplicate = questions[questionIndex];
        const newQuestion: QuestionTemplate = {
            ...JSON.parse(JSON.stringify(questionToDuplicate)),
            id: questionCounter,
            expanded: true
        };

        const updatedQuestions = [...questions];
        updatedQuestions.splice(questionIndex + 1, 0, newQuestion);
        setQuestions(updatedQuestions);
        setQuestionCounter(questionCounter + 1);
    };

    // Soruyu kaldır
    const handleRemoveQuestion = (questionIndex: number) => {
        const updatedQuestions = questions.filter((_, index) => index !== questionIndex);
        setQuestions(updatedQuestions);
    };

    // Soru metnini güncelle
    const handleQuestionTextChange = (text: string, questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].questionText = text;
        setQuestions(updatedQuestions);
    };

    // Zorluk seviyesini güncelle
    const handleDifficultyChange = (value: string, questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].difficulty = value;
        setQuestions(updatedQuestions);
    };

    // Doğru/Yanlış değerini güncelle
    const handleTrueFalseChange = (value: string, questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].trueOrFalse = value;
        setQuestions(updatedQuestions);
    };

    // Klasik soru cevabını güncelle
    const handleCorrectAnswerChange = (text: string, questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].correctAnswer = text;
        setQuestions(updatedQuestions);
    };

    // Çoktan seçmeli şık metnini güncelle
    const handleChoiceTextChange = (text: string, choiceId: string, questionIndex: number) => {
        const updatedQuestions = [...questions];
        const choiceIndex = updatedQuestions[questionIndex].choices.findIndex(c => c.id === choiceId);
        updatedQuestions[questionIndex].choices[choiceIndex].text = text;
        setQuestions(updatedQuestions);
    };

    // Doğru şıkkı güncelle
    const handleCorrectChoiceChange = (choiceId: string, questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].choices.forEach(choice => {
            choice.isCorrect = choice.id === choiceId;
        });
        setQuestions(updatedQuestions);
    };

    // Resim seçimi
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, questionIndex: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Dosya boyutu kontrolü (2MB)
        if (file.size > 2 * 1024 * 1024) {
            const updatedQuestions = [...questions];
            updatedQuestions[questionIndex].error = "Dosya boyutu 2MB'dan küçük olmalıdır.";
            setQuestions(updatedQuestions);
            return;
        }

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
            const updatedQuestions = [...questions];
            updatedQuestions[questionIndex].error = "Sadece resim dosyaları yüklenebilir.";
            setQuestions(updatedQuestions);
            return;
        }

        const objectUrl = URL.createObjectURL(file);

        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].imageFile = file;
        updatedQuestions[questionIndex].imagePath = objectUrl;
        updatedQuestions[questionIndex].error = null;
        setQuestions(updatedQuestions);
    };

    // Resmi kaldır
    const handleRemoveImage = (questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].imageFile = null;
        updatedQuestions[questionIndex].imagePath = null;
        setQuestions(updatedQuestions);
    };

    // Soru açılır/kapanır durumunu değiştir
    const handleExpandQuestion = (questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].expanded = !updatedQuestions[questionIndex].expanded;
        setQuestions(updatedQuestions);
    };

    // Tüm soruları doğrula
    const validateQuestions = (): boolean => {
        if (!questionType || !categoryId) {
            setError('Lütfen soru tipi ve kategori seçin');
            return false;
        }

        if (questions.length === 0) {
            setError('En az bir soru eklemelisiniz');
            return false;
        }

        const updatedQuestions = [...questions];
        let allValid = true;

        updatedQuestions.forEach((question) => {
            let valid = true;

            // Soru metni kontrolü
            if (!question.questionText.trim()) {
                valid = false;
                question.error = 'Soru metni boş olamaz';
            } else {
                question.error = null;

                // Cevap kontrolü
                if (questionType === 'multiple_choice') {
                    // Tüm şıkların dolu olduğunu kontrol et
                    const allChoicesFilled = question.choices.every(choice => choice.text.trim() !== '');
                    // En az bir doğru şık seçildiğini kontrol et
                    const hasCorrectChoice = question.choices.some(choice => choice.isCorrect);

                    if (!allChoicesFilled) {
                        valid = false;
                        question.error = 'Tüm şıkları doldurun';
                    } else if (!hasCorrectChoice) {
                        valid = false;
                        question.error = 'Bir doğru şık seçin';
                    }
                } else if (questionType === 'qa') {
                    if (!question.correctAnswer.trim()) {
                        valid = false;
                        question.error = 'Doğru cevabı girin';
                    }
                }
                // true_false için özel doğrulama gerekmez
            }

            question.valid = valid;
            if (!valid) allValid = false;
        });

        setQuestions(updatedQuestions);
        return allValid;
    };

    // Soruları kaydet
    const handleSaveQuestions = async () => {
        if (!validateQuestions()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const savedQuestions = [];

            // Her soru için kayıt işlemini yap
            for (const question of questions) {
                // Soru tipine göre cevapları hazırla
                const answers = getAnswersBasedOnType(question);

                // QuestionCreate için veri oluştur
                const questionData: questionService.QuestionCreate = {
                    category_id: categoryId as number,
                    question_text: question.questionText,
                    question_type: questionType as 'multiple_choice' | 'true_false' | 'qa',
                    difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
                    answers
                };

                // Resim varsa yükle
                if (question.imageFile) {
                    try {
                        const uploadResponse = await questionService.uploadImage(question.imageFile);
                        questionData.image_path = uploadResponse.url;
                    } catch (error) {
                        console.error('Resim yükleme hatası:', error);
                        throw new Error(`${question.id} numaralı sorunun resmi yüklenemedi`);
                    }
                }

                // Soruyu kaydet
                const savedQuestion = await questionService.createQuestion(questionData);
                savedQuestions.push(savedQuestion);
            }

            setSuccess(true);
            setError(null);
            setTimeout(() => {
                if (navigateAfterSave) {
                    navigate('/questions');
                } else {
                    // Sayfayı temizle ve yeni sorular için hazırla
                    setQuestions([]);
                    setSuccess(false);
                }
            }, 2000);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                setError(axiosError.response?.data?.message || 'Sorular eklenirken bir hata oluştu');
                console.error('Sorular kaydedilirken hata:', axiosError.response?.data);
            } else {
                setError('Sorular eklenirken beklenmeyen bir hata oluştu');
                console.error('Beklenmeyen hata:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Soru tipine göre cevapları düzenle
    const getAnswersBasedOnType = (question: QuestionTemplate) => {
        switch (questionType) {
            case 'multiple_choice':
                return question.choices.map(choice => ({
                    answer_text: choice.text,
                    is_correct: choice.isCorrect
                }));
            case 'true_false':
                return [
                    { answer_text: 'Doğru', is_correct: question.trueOrFalse === 'true' },
                    { answer_text: 'Yanlış', is_correct: question.trueOrFalse === 'false' }
                ];
            case 'qa':
                return [{ answer_text: question.correctAnswer, is_correct: true }];
            default:
                return [];
        }
    };

    // Uyarı dialogunu kapat ve soru tipini güncelle
    const handleConfirmChange = (confirm: boolean) => {
        setConfirmDialogOpen(false);

        if (confirm) {
            // Soruları temizle
            setQuestions([]);
        }
    };

    const canProceed = questionType !== '' && categoryId !== '';

    return (
        <Box sx={{
            width: '100%',
            px: 3,
            boxSizing: 'border-box'
        }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Toplu Soru Ekleme
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Genel Ayarlar
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Soru Tipi
                        </Typography>
                        <RadioGroup
                            row
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                        >
                            {questionTypes.map((type) => (
                                <FormControlLabel
                                    key={type.value}
                                    value={type.value}
                                    control={<Radio />}
                                    label={type.label}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    <Typography variant="subtitle1" gutterBottom>
                        Kategori
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <FormControl fullWidth required sx={{ mb: 2, maxWidth: 300 }}>
                            <InputLabel>Kategori</InputLabel>
                            <Select
                                value={categoryId}
                                label="Kategori"
                                onChange={(e) => setCategoryId(e.target.value as number)}
                                required
                            >
                                <MenuItem value="" disabled>Kategori Seçin</MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ mb: 2, maxWidth: 200 }} disabled>
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

                        <FormControl sx={{ mb: 2, maxWidth: 200 }} disabled>
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

                        <FormControl sx={{ mb: 2, maxWidth: 200 }} disabled>
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

                        <FormControl sx={{ mb: 2, maxWidth: 200 }} disabled>
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
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {!canProceed ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Lütfen önce soru tipi ve kategori seçin.
                    </Alert>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                Sorular ({questions.length})
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddQuestion}
                                disabled={!canProceed}
                            >
                                Yeni Soru Ekle
                            </Button>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                Sorular başarıyla kaydedildi!
                            </Alert>
                        )}

                        {questions.length === 0 ? (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Henüz soru eklenmedi. "Yeni Soru Ekle" butonuna tıklayarak başlayabilirsiniz.
                            </Alert>
                        ) : (
                            <Box sx={{ mb: 4 }}>
                                {questions.map((question, index) => (
                                    <Accordion
                                        key={question.id}
                                        expanded={question.expanded}
                                        onChange={() => handleExpandQuestion(index)}
                                        sx={{
                                            mb: 2,
                                            border: question.error ? '1px solid #f44336' : 'none',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                                <Typography sx={{ flexGrow: 1 }}>
                                                    {`Soru ${index + 1}: ${question.questionText.substring(0, 50)}${question.questionText.length > 50 ? '...' : ''}`}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                                                    <Tooltip title="Soruyu Kopyala">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDuplicateQuestion(index);
                                                            }}
                                                        >
                                                            <FileCopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Soruyu Sil">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveQuestion(index);
                                                            }}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {question.error && (
                                                <Alert severity="error" sx={{ mb: 2 }}>
                                                    {question.error}
                                                </Alert>
                                            )}

                                            <Box sx={{ mb: 3 }}>
                                                <TextField
                                                    label="Soru Metni"
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    value={question.questionText}
                                                    onChange={(e) => handleQuestionTextChange(e.target.value, index)}
                                                    required
                                                    error={!!question.error && !question.questionText.trim()}
                                                />
                                            </Box>

                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                    Soru Resmi (Opsiyonel)
                                                </Typography>

                                                {question.imagePath && (
                                                    <Box sx={{ mb: 2, position: 'relative', width: 'fit-content' }}>
                                                        <img
                                                            src={question.imagePath}
                                                            alt={`Soru ${index + 1} resmi`}
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
                                                            onClick={() => handleRemoveImage(index)}
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
                                                >
                                                    Resim Seç
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        onChange={(e) => handleImageUpload(e, index)}
                                                    />
                                                </Button>
                                            </Box>

                                            <Box sx={{ mb: 3 }}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Zorluk Seviyesi</InputLabel>
                                                    <Select
                                                        value={question.difficulty}
                                                        label="Zorluk Seviyesi"
                                                        onChange={(e) => handleDifficultyChange(e.target.value, index)}
                                                    >
                                                        {difficultyLevels.map((level) => (
                                                            <MenuItem key={level.value} value={level.value}>
                                                                {level.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>

                                            <Divider sx={{ my: 2 }} />

                                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                                Cevap Bilgisi
                                            </Typography>

                                            {questionType === 'multiple_choice' && (
                                                <Box sx={{ mb: 2 }}>
                                                    {question.choices.map((choice) => (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} key={choice.id}>
                                                            <Radio
                                                                checked={choice.isCorrect}
                                                                onChange={() => handleCorrectChoiceChange(choice.id, index)}
                                                            />
                                                            <TextField
                                                                label={`${choice.id} Şıkkı`}
                                                                fullWidth
                                                                value={choice.text}
                                                                onChange={(e) => handleChoiceTextChange(e.target.value, choice.id, index)}
                                                                error={!!question.error && !choice.text.trim()}
                                                                required
                                                            />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            {questionType === 'true_false' && (
                                                <FormControl component="fieldset">
                                                    <RadioGroup
                                                        value={question.trueOrFalse}
                                                        onChange={(e) => handleTrueFalseChange(e.target.value, index)}
                                                    >
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
                                                    value={question.correctAnswer}
                                                    onChange={(e) => handleCorrectAnswerChange(e.target.value, index)}
                                                    error={!!question.error && !question.correctAnswer.trim()}
                                                    required
                                                />
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        )}

                        {questions.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/questions')}
                                    disabled={loading}
                                >
                                    İptal
                                </Button>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        onClick={() => {
                                            setNavigateAfterSave(false);
                                            handleSaveQuestions();
                                        }}
                                        disabled={loading || success}
                                    >
                                        {loading ? (
                                            <>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Kaydediliyor...
                                            </>
                                        ) : 'Kaydet ve Devam Et'}
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<SaveIcon />}
                                        onClick={() => {
                                            setNavigateAfterSave(true);
                                            handleSaveQuestions();
                                        }}
                                        disabled={loading || success}
                                    >
                                        {loading ? (
                                            <>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Kaydediliyor...
                                            </>
                                        ) : 'Kaydet ve Tamamla'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </Paper>

            {/* Onay Dialogu */}
            <Dialog open={confirmDialogOpen} onClose={() => handleConfirmChange(false)}>
                <DialogTitle>Değişiklikleri Onayla</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Soru tipi veya kategori değişikliği, mevcut tüm soruları silecektir. Devam etmek istiyor musunuz?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleConfirmChange(false)}>İptal</Button>
                    <Button onClick={() => handleConfirmChange(true)} color="error">
                        Evet, Temizle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Yeni Soru Ekle FAB */}
            {canProceed && (
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={handleAddQuestion}
                    sx={{ position: 'fixed', bottom: 32, right: 32 }}
                >
                    <AddIcon />
                </Fab>
            )}
        </Box>
    );
};

export default TopluSoruEkleme;