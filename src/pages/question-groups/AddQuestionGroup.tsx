// src/pages/question-groups/AddQuestionGroup.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Stepper, Step, StepLabel, Button,
    Grid, TextField, FormControl, InputLabel, Select, MenuItem,
    SelectChangeEvent, Divider, Alert, CircularProgress, List,
    ListItem, ListItemText, Checkbox, ListItemIcon, Pagination,
    FormHelperText, Chip, IconButton
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import * as questionGroupService from '../../services/question-group.service';
import * as gameService from '../../services/game.service';
import * as userService from '../../services/user.service';
import { useCategories } from '../../hooks/useCategories';
import * as categoryService from '../../services/category.service';
import {useEducationStructure} from "../../hooks/useEducationStructure.ts";

const steps = ['Etkinlik Bilgileri', 'Soru Seçimi', 'Önizleme'];

// Drag & Drop dosya yükleme için stiller
const dropzoneStyles = {
    border: '2px dashed #cccccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
    transition: 'border .3s ease-in-out, background-color .3s ease-in-out',
    '&:hover': {
        backgroundColor: '#f0f0f0',
        borderColor: '#999999'
    },
    '&.active': {
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)'
    }
};

const AddQuestionGroup = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    // Form verileri
    const [name, setName] = useState('');
    const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false' | 'qa'>('multiple_choice');
    const [gameId, setGameId] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [categoryExists, setCategoryExists] = useState<boolean>(false);
    const [creatingCategory, setCreatingCategory] = useState<boolean>(false);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    const [publisherId, setPublisherId] = useState<string>(''); // YENİ: Publisher alanı

    // Filtrelenmiş listeler
    const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<any[]>([]);

    // Manuel seçim alanları
    const [gradeId, setGradeId] = useState<number | ''>('');
    const [subjectId, setSubjectId] = useState<number | ''>('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [topicId, setTopicId] = useState<number | ''>('');

    // Görsel yükleme için yeni state değişkenleri
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

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

    const { grades, subjects, units, topics } = useEducationStructure();
    const { categories, refreshCategories } = useCategories();

    // YENİ: Current user'ı yükle ve default publisher'ı set et
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await userService.getCurrentUser();
                if (user.publisher) {
                    setPublisherId(user.publisher);
                }
            } catch (error) {
                console.error('Current user yüklenirken hata:', error);
            }
        };

        fetchCurrentUser();
    }, []);

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

    // Grade ve Subject değiştiğinde ilgili üniteleri filtrele
    useEffect(() => {
        if (gradeId && subjectId) {
            const filtered = units.filter(
                unit => unit.grade_id === gradeId && unit.subject_id === subjectId
            );
            setFilteredUnits(filtered);

            // Eğer seçili ünite bu filtrelere uygun değilse, seçimi sıfırla
            if (unitId && !filtered.some(unit => unit.id === unitId)) {
                setUnitId('');
                setTopicId('');
            }
        } else {
            setFilteredUnits([]);
            setUnitId('');
            setTopicId('');
        }
    }, [gradeId, subjectId, units, unitId]);

    // Unit değiştiğinde ilgili konuları filtrele
    useEffect(() => {
        if (unitId) {
            const filtered = topics.filter(topic => topic.unit_id === unitId);
            setFilteredTopics(filtered);

            // Eğer seçili konu bu filtreye uygun değilse, seçimi sıfırla
            if (topicId && !filtered.some(topic => topic.id === topicId)) {
                setTopicId('');
            }
        } else {
            setFilteredTopics([]);
            setTopicId('');
        }
    }, [unitId, topics, topicId]);

    // Seçilen kombinasyona göre kategori durumunu kontrol et
    useEffect(() => {
        // Kategori kontrolü için tüm 4 alan gerekli: gradeId, subjectId, unitId, topicId
        if (gradeId && subjectId && unitId && topicId) {
            const matchingCategory = categories.find(category =>
                category.grade_id === gradeId &&
                category.subject_id === subjectId &&
                category.unit_id === unitId &&
                category.topic_id === topicId
            );

            if (matchingCategory) {
                setCategoryExists(true);
                setCategoryId(matchingCategory.id.toString());
            } else {
                setCategoryExists(false);
                setCategoryId('');
            }
        } else {
            setCategoryExists(false);
            setCategoryId('');
        }
    }, [gradeId, subjectId, unitId, topicId, categories]);

    // Seçilen oyun ve soru tipine göre uygun soruları yükle
    useEffect(() => {
        if (activeStep === 1 && gameId && questionType && categoryId) {
            fetchEligibleQuestions();
            setSelectAllChecked(false);
        }
    }, [activeStep, gameId, questionType, categoryId, questionsPage]);

    const fetchEligibleQuestions = async () => {
        try {
            setQuestionsLoading(true);
            const response = await questionGroupService.getEligibleQuestions({
                game_id: parseInt(gameId),
                question_type: questionType,
                category_id: parseInt(categoryId),
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

    // YENİ: Publisher değiştir
    const handlePublisherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPublisherId(event.target.value);
    };

    // Kategori adını oluştur
    const generateCategoryName = (): string => {
        const gradeName = grades.find(g => g.id === gradeId)?.name || '';
        const subjectName = subjects.find(s => s.id === subjectId)?.name || '';
        const unitName = unitId ? units.find(u => u.id === unitId)?.name : '';
        const topicName = topicId ? topics.find(t => t.id === topicId)?.name : '';

        let categoryName = `${gradeName} - ${subjectName}`;
        if (unitName) categoryName += ` - ${unitName}`;
        if (topicName) categoryName += ` - ${topicName}`;

        return categoryName;
    };

    // Yeni kategori oluştur
    const handleCreateCategory = async () => {
        if (!gradeId || !subjectId || !unitId || !topicId) {
            setError('Sınıf, ders, ünite ve konu seçimi zorunludur.');
            return;
        }

        setCreatingCategory(true);
        setError(null);

        try {
            const categoryData: categoryService.CategoryCreate = {
                name: generateCategoryName(),
                grade_id: gradeId as number,
                subject_id: subjectId as number,
                unit_id: unitId as number,
                topic_id: topicId as number
            };

            const newCategory = await categoryService.createCategory(categoryData);

            // Kategorileri yenile
            await refreshCategories();

            // Yeni kategoriyi seç
            setCategoryId(newCategory.id.toString());
            setCategoryExists(true);

            setError(null);
        } catch (err) {
            console.error('Error creating category:', err);
            setError('Kategori oluşturulurken bir hata oluştu.');
        } finally {
            setCreatingCategory(false);
        }
    };

    // Form alanları için handle fonksiyonları
    const handleGradeChange = (event: SelectChangeEvent<number | ''>) => {
        setGradeId(event.target.value as number | '');
    };

    const handleSubjectChange = (event: SelectChangeEvent<number | ''>) => {
        setSubjectId(event.target.value as number | '');
    };

    const handleUnitChange = (event: SelectChangeEvent<number | ''>) => {
        setUnitId(event.target.value as number | '');
    };

    const handleTopicChange = (event: SelectChangeEvent<number | ''>) => {
        setTopicId(event.target.value as number | '');
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

    // Sayfadaki tüm soruları seç/kaldır
    const handleSelectAllToggle = () => {
        if (selectAllChecked) {
            // Tüm seçimleri kaldır
            setSelectedQuestions(prev =>
                prev.filter(id => !eligibleQuestions.some(q => q.id === id))
            );
        } else {
            // Bu sayfadaki tüm soruları ekle (48 soru limitini aşmamak kaydıyla)
            const newSelections = [...selectedQuestions];

            eligibleQuestions.forEach(question => {
                if (!newSelections.includes(question.id) && newSelections.length < 48) {
                    newSelections.push(question.id);
                }
            });

            setSelectedQuestions(newSelections);
        }

        setSelectAllChecked(!selectAllChecked);
    };

    // Görsel yükleme işlemleri
    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
        }
    };

    const handleFileChange = (file: File) => {
        // Dosya tipini kontrol et
        if (!file.type.match('image.*')) {
            setUploadError('Lütfen geçerli bir görsel dosyası yükleyin (JPEG, PNG, GIF, vs.)');
            return;
        }

        // Dosya boyutunu kontrol et (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Görsel dosyası 5MB\'tan küçük olmalıdır');
            return;
        }

        setUploadError(null);
        setImageFile(file);

        // Önizleme URL'i oluştur
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setUploadError(null);
    };

    // Form gönderme - YENİ: Publisher dahil
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

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

            const formData = new FormData();
            formData.append('name', name);
            formData.append('question_type', questionType);
            formData.append('game_id', gameId);
            formData.append('category_id', categoryId);
            formData.append('publisher', publisherId); // YENİ: Publisher eklendi

            selectedQuestions.forEach((id, index) => {
                formData.append(`question_ids[${index}]`, id.toString());
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await questionGroupService.createQuestionGroupWithImage(formData);
            alert('Soru grubu başarıyla oluşturuldu.');
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

    // Adım geçerlilik kontrolleri - YENİ: Publisher kontrolü eklendi
    const isFirstStepValid = () => {
        return name.trim() !== '' && gameId !== '' && publisherId.trim() !== '';
    };

    const isSecondStepValid = () => {
        return selectedQuestions.length >= 16 && selectedQuestions.length <= 48;
    };

    // Adım içeriği
    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{
                        width: '100%',
                        px: 2,
                        boxSizing: 'border-box'
                    }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Etkinlik Bilgilerini Girin
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Etkinlik Adı"
                                    fullWidth
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Grid>

                            {/* YENİ: Publisher Alanı */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Yayınevi"
                                    fullWidth
                                    value={publisherId}
                                    onChange={handlePublisherChange}
                                    required
                                    helperText="Yayınevi adını girin veya düzenleyin"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Kategori Seçimi
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'end' }}>
                                    <FormControl fullWidth required sx={{ mb: 2, maxWidth: 200 }}>
                                        <InputLabel>Sınıf</InputLabel>
                                        <Select
                                            value={gradeId}
                                            label="Sınıf"
                                            onChange={handleGradeChange}
                                            required
                                        >
                                            <MenuItem value="" disabled>Sınıf Seçin</MenuItem>
                                            {grades.map((grade) => (
                                                <MenuItem key={grade.id} value={grade.id}>
                                                    {grade.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth required sx={{ mb: 2, maxWidth: 200 }}>
                                        <InputLabel>Ders</InputLabel>
                                        <Select
                                            value={subjectId}
                                            label="Ders"
                                            onChange={handleSubjectChange}
                                            required
                                        >
                                            <MenuItem value="" disabled>Ders Seçin</MenuItem>
                                            {subjects.map((subject) => (
                                                <MenuItem key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth required sx={{ mb: 2, maxWidth: 200 }}>
                                        <InputLabel>Ünite</InputLabel>
                                        <Select
                                            value={unitId}
                                            label="Ünite"
                                            onChange={handleUnitChange}
                                            disabled={!gradeId || !subjectId || filteredUnits.length === 0}
                                        >
                                            <MenuItem value="">Ünite Seçin </MenuItem>
                                            {filteredUnits.map((unit) => (
                                                <MenuItem key={unit.id} value={unit.id}>
                                                    {unit.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth required sx={{ mb: 2, maxWidth: 200 }}>
                                        <InputLabel>Konu</InputLabel>
                                        <Select
                                            value={topicId}
                                            label="Konu"
                                            onChange={handleTopicChange}
                                            disabled={!unitId || filteredTopics.length === 0}
                                        >
                                            <MenuItem value="">Konu Seçin </MenuItem>
                                            {filteredTopics.map((topic) => (
                                                <MenuItem key={topic.id} value={topic.id}>
                                                    {topic.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {gradeId && subjectId && unitId && topicId && !categoryExists && (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleCreateCategory}
                                            disabled={creatingCategory}
                                            sx={{ mb: 2, height: 'fit-content' }}
                                        >
                                            {creatingCategory ? (
                                                <>
                                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                                    Oluşturuluyor...
                                                </>
                                            ) : (
                                                'Kategoriyi Ekle'
                                            )}
                                        </Button>
                                    )}
                                </Box>

                                {gradeId && subjectId && unitId && topicId && (
                                    <Alert
                                        severity={categoryExists ? "success" : "info"}
                                        sx={{ mt: 2 }}
                                    >
                                        {categoryExists
                                            ? `Kategori mevcut: ${generateCategoryName()}`
                                            : `Bu kombinasyon için kategori bulunamadı: ${generateCategoryName()}`
                                        }
                                    </Alert>
                                )}

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

                            {/* Görsel Yükleme Alanı */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Etkinlik Görseli (Opsiyonel)
                                </Typography>

                                {imagePreview ? (
                                    <Box sx={{
                                        position: 'relative',
                                        width: 'fit-content',
                                        margin: '0 auto',
                                        mb: 2
                                    }}>
                                        <Box
                                            component="img"
                                            src={imagePreview}
                                            alt="Etkinlik görseli önizleme"
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                borderRadius: 1,
                                                border: '1px solid #e0e0e0'
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleRemoveImage}
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                bgcolor: 'rgba(255, 255, 255, 0.7)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                }
                                            }}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            ...dropzoneStyles,
                                            ...(dragActive ? {
                                                borderColor: '#2196f3',
                                                backgroundColor: 'rgba(33, 150, 243, 0.1)'
                                            } : {})
                                        }}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <CloudUploadIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
                                        <Typography>
                                            Görsel yüklemek için tıklayın veya sürükleyin
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Maksimum dosya boyutu: 5MB (JPEG, PNG, GIF)
                                        </Typography>
                                    </Box>
                                )}

                                {uploadError && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {uploadError}
                                    </Alert>
                                )}
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
                                    {/* Tümünü Seç header */}
                                    <ListItem
                                        dense
                                        sx={{
                                            borderBottom: '2px solid #f0f0f0',
                                            bgcolor: '#f9f9f9',
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={selectAllChecked}
                                                onChange={handleSelectAllToggle}
                                                disabled={eligibleQuestions.length === 0 || (selectedQuestions.length >= 48 && !selectAllChecked)}
                                                indeterminate={
                                                    selectedQuestions.some(id => eligibleQuestions.some(q => q.id === id)) &&
                                                    !eligibleQuestions.every(q => selectedQuestions.includes(q.id))
                                                }
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle2">
                                                    Sayfadaki Tüm Soruları Seç
                                                    {selectedQuestions.length >= 48 && !selectAllChecked ?
                                                        " (maksimum 48 soru seçilebilir)" : ""}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
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
                            Etkinlik Önizleme
                        </Typography>

                        <Grid container spacing={3}>
                            {/* Görsel Önizleme */}
                            {imagePreview && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Etkinlik Görseli:
                                    </Typography>
                                    <Box
                                        component="img"
                                        src={imagePreview}
                                        alt="Etkinlik görseli"
                                        sx={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            mt: 1,
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Grup Adı:
                                </Typography>
                                <Typography>{name}</Typography>
                            </Grid>

                            {/* YENİ: Publisher Önizleme */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Yayınevi:
                                </Typography>
                                <Typography>{publisherId || '-'}</Typography>
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
                Yeni Etkinlik Oluştur
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