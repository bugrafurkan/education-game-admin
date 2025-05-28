// src/pages/questions/ExcelSoruImport.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, FormControl, InputLabel,
    Select, MenuItem, Alert, CircularProgress, Divider, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Tooltip, LinearProgress, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, IconButton, RadioGroup,
    FormControlLabel, Radio, SelectChangeEvent
} from '@mui/material';
import {
    FileUpload as FileUploadIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Download as DownloadIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Close as CloseIcon,
    Help as HelpIcon
} from '@mui/icons-material';
import { useEducationStructure } from '../../hooks/useEducationStructure';
import { useCategories } from '../../hooks/useCategories';
import * as questionService from '../../services/question.service';
import * as gameService from '../../services/game.service';
import * as XLSX from 'xlsx';

interface ExcelQuestion {
    id: number;
    question_text: string;
    is_correct?: boolean;
    answer_text?: string;
    valid: boolean;
    error?: string;
}

interface ImportStats {
    total: number;
    valid: number;
    invalid: number;
    saved: number;
    failed: number;
}

const ExcelSoruImport = () => {
    const navigate = useNavigate();

    // Kategori seçimi
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [gradeId, setGradeId] = useState<number | ''>('');
    const [subjectId, setSubjectId] = useState<number | ''>('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [topicId, setTopicId] = useState<number | ''>('');

    // Soru tipi seçimi
    const [questionType, setQuestionType] = useState<'true_false' | 'text'>('true_false');

    // Dosya ve içerik
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [questions, setQuestions] = useState<ExcelQuestion[]>([]);
    const [parseError, setParseError] = useState<string | null>(null);

    // UI durumları
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [stats, setStats] = useState<ImportStats>({
        total: 0,
        valid: 0,
        invalid: 0,
        saved: 0,
        failed: 0
    });

    // Yardım diyaloğu
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);

    // Eğitim yapısı verilerini yükle
    const { grades, subjects, units, topics } = useEducationStructure();
    const { categories } = useCategories();

    // Kategori değişikliğini takip et
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

    // Soru tipi değiştiğinde seçili dosyayı temizle
    useEffect(() => {
        if (selectedFile) {
            handleClearFile();
        }
    }, [questionType]);

    // Excel dosyası yükle ve parse et
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Dosya tipi kontrolü
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setParseError('Lütfen geçerli bir Excel (.xlsx, .xls) veya CSV dosyası yükleyin.');
            return;
        }

        setSelectedFile(file);
        setParseError(null);
        setGlobalError(null);
        setLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    throw new Error('Dosya okunamadı');
                }

                // Excel dosyasını oku
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Excel verilerini JSON'a dönüştür
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                if (jsonData.length <= 1) {
                    setParseError('Excel dosyası boş veya sadece başlık satırı içeriyor.');
                    setLoading(false);
                    return;
                }

                // İlk satır başlık satırı olduğunu varsayıyoruz
                const headers = jsonData[0];

                // Gerekli sütunları kontrol et
                const questionColIndex = headers.findIndex((h: string) =>
                    h?.toString().toLowerCase().includes('soru') ||
                    h?.toString().toLowerCase().includes('question'));

                // Soru tipi Doğru/Yanlış ise doğru/yanlış sütununu, Klasik ise cevap sütununu ara
                let answerColIndex = -1;

                if (questionType === 'true_false') {
                    answerColIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('doğru') ||
                        h?.toString().toLowerCase().includes('yanlış') ||
                        h?.toString().toLowerCase().includes('dogru') ||
                        h?.toString().toLowerCase().includes('yanlis') ||
                        h?.toString().toLowerCase().includes('true') ||
                        h?.toString().toLowerCase().includes('false'));
                } else {
                    answerColIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('cevap') ||
                        h?.toString().toLowerCase().includes('answer'));
                }

                if (questionColIndex === -1 || answerColIndex === -1) {
                    let errorMessage = 'Excel dosyasında gerekli sütunlar bulunamadı. ';

                    if (questionType === 'true_false') {
                        errorMessage += 'Lütfen "Soru Metni" ve "Doğru/Yanlış" sütunlarının bulunduğundan emin olun.';
                    } else {
                        errorMessage += 'Lütfen "Soru Metni" ve "Cevap" sütunlarının bulunduğundan emin olun.';
                    }

                    setParseError(errorMessage);
                    setLoading(false);
                    return;
                }

                // Verileri doğrula ve işle
                const parsedQuestions: ExcelQuestion[] = [];
                let counter = 0;

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];

                    // Boş satırları atla
                    if (!row || row.length === 0 || !row[questionColIndex]) continue;

                    const questionText = row[questionColIndex]?.toString().trim();
                    let valid = true;
                    let error = undefined;
                    let isCorrect: boolean | undefined = undefined;
                    let answerText: string | undefined = undefined;

                    // Soru tipine göre farklı işlem yap
                    if (questionType === 'true_false') {
                        // Doğru/Yanlış değerini işle
                        if (row[answerColIndex]) {
                            const answerValue = row[answerColIndex]?.toString().toLowerCase().trim();

                            if (['doğru', 'dogru', 'true', 'd', 't', 'evet', 'yes', '1'].includes(answerValue)) {
                                isCorrect = true;
                            } else if (['yanlış', 'yanlis', 'false', 'y', 'f', 'hayır', 'hayir', 'no', '0'].includes(answerValue)) {
                                isCorrect = false;
                            } else {
                                valid = false;
                                error = 'Geçersiz doğru/yanlış değeri';
                            }
                        } else {
                            valid = false;
                            error = 'Doğru/Yanlış değeri eksik';
                        }
                    } else {
                        // Klasik soru için cevap metnini kontrol et
                        answerText = row[answerColIndex]?.toString().trim();
                        if (!answerText || answerText.length < 1) {
                            valid = false;
                            error = 'Cevap metni eksik';
                        }
                    }

                    // Soru metni kontrolü (her iki tip için ortak)
                    if (!questionText || questionText.length < 3) {
                        valid = false;
                        error = 'Geçersiz soru metni';
                    }

                    parsedQuestions.push({
                        id: ++counter,
                        question_text: questionText || '',
                        is_correct: isCorrect,
                        answer_text: answerText,
                        valid,
                        error
                    });
                }

                // İstatistikler
                const validCount = parsedQuestions.filter(q => q.valid).length;

                setQuestions(parsedQuestions);
                setStats({
                    ...stats,
                    total: parsedQuestions.length,
                    valid: validCount,
                    invalid: parsedQuestions.length - validCount,
                    saved: 0,
                    failed: 0
                });

                // Hiç soru bulunamadıysa hata göster
                if (parsedQuestions.length === 0) {
                    setParseError('Excel dosyasında işlenebilecek soru bulunamadı.');
                }

            } catch (error) {
                console.error('Excel okuma hatası:', error);
                setParseError('Excel dosyası okunurken bir hata oluştu. Lütfen dosya formatını kontrol edin.');
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = () => {
            setParseError('Dosya okunurken bir hata oluştu.');
            setLoading(false);
        };

        reader.readAsBinaryString(file);
    };

    // Soruları kaydet
    // Soruları kaydet ve tüm oyunlara ekle
    const handleSaveQuestions = async () => {
        if (!categoryId) {
            setGlobalError('Lütfen bir kategori seçin.');
            return;
        }

        if (questions.length === 0) {
            setGlobalError('Kaydedilecek soru bulunamadı.');
            return;
        }

        const validQuestions = questions.filter(q => q.valid);
        if (validQuestions.length === 0) {
            setGlobalError('Kaydedilecek geçerli soru bulunamadı. Lütfen Excel verilerinizi kontrol edin.');
            return;
        }

        setSaving(true);
        setGlobalError(null);

        const newStats = {
            ...stats,
            saved: 0,
            failed: 0
        };

        // Kaydedilen soruların ID'lerini tutacak dizi
        const savedQuestionIds: number[] = [];

        // Her bir soruyu sırayla kaydet
        for (const question of validQuestions) {
            try {
                // QuestionCreate için veri oluştur
                let questionData: questionService.QuestionCreate;

                if (questionType === 'true_false') {
                    // Doğru-Yanlış tipi soru
                    questionData = {
                        category_id: categoryId as number,
                        question_text: question.question_text,
                        question_type: 'true_false',
                        difficulty: 'medium',
                        answers: [
                            { answer_text: 'Doğru', is_correct: question.is_correct === true },
                            { answer_text: 'Yanlış', is_correct: question.is_correct === false }
                        ]
                    };
                } else {
                    // Klasik tipi soru
                    questionData = {
                        category_id: categoryId as number,
                        question_text: question.question_text,
                        question_type: 'qa',
                        difficulty: 'medium',
                        answers: [
                            { answer_text: question.answer_text || '', is_correct: true }
                        ]
                    };
                }

                // Soruyu kaydet
                const savedQuestion = await questionService.createQuestion(questionData);

                // Kaydedilen sorunun ID'sini diziye ekle
                if (savedQuestion && savedQuestion.id) {
                    savedQuestionIds.push(savedQuestion.id);
                }

                newStats.saved++;

            } catch (error) {
                console.error(`Soru kaydedilirken hata (ID: ${question.id}):`, error);
                newStats.failed++;
            }
        }

        // Tüm oyunları al ve kaydedilen soruları tüm oyunlara ekle
        try {
            // Eğer başarıyla kaydedilen sorular varsa
            if (savedQuestionIds.length > 0) {
                // Tüm oyunları getir
                const gamesResponse = await gameService.getGames(1);
                const games = gamesResponse.data;

                // Her oyun için
                for (const game of games) {
                    // Her soruyu oyuna ekle
                    for (const questionId of savedQuestionIds) {
                        try {
                            await gameService.addQuestionToGame(game.id, {
                                question_id: questionId,
                                points: 100 // Varsayılan puan
                            });
                        } catch (error) {
                            console.error(`Soru (ID: ${questionId}) oyuna (ID: ${game.id}) eklenirken hata:`, error);
                            // Oyuna ekleme hatası genel istatistikleri etkilemesin
                        }
                    }
                }

                console.log(`${savedQuestionIds.length} soru ${games.length} oyuna başarıyla eklendi`);
            }
        } catch (error) {
            console.error('Oyunlar alınırken veya sorular oyunlara eklenirken hata:', error);
            // Oyunlara ekleme hatası genel istatistikleri etkilemesin
        }

        setStats(newStats);
        setSaving(false);
        setSuccess(true);

        // Başarı mesajı göster, ardından sayfayı temizle
        setTimeout(() => {
            if (newStats.failed === 0) {
                // Tüm sorular başarıyla kaydedildiyse
                navigate('/questions');
            } else {
                setSuccess(false);
            }
        }, 3000);
    };

    // Örnek Excel dosyası indir
    const handleDownloadTemplate = () => {
        // Örnek veri oluştur
        type TemplateData = string[][];
        let data: TemplateData = [];

        if (questionType === 'true_false') {
            data = [
                ['Soru Metni', 'Doğru/Yanlış'],
                ['Türkiye\'nin başkenti Ankara\'dır.', 'Doğru'],
                ['Dünya düzdür.', 'Yanlış'],
                ['Su 100 derecede kaynar.', 'Doğru'],
                ['İnsan kalbi sağ taraftadır.', 'Yanlış']
            ];
        } else {
            data = [
                ['Soru Metni', 'Cevap'],
                ['Türkiye\'nin başkenti neresidir?', 'Ankara'],
                ['2+2 kaçtır?', '4'],
                ['Dünyanın en büyük okyanusu hangisidir?', 'Pasifik Okyanusu'],
                ['Cumhuriyet hangi yılda ilan edilmiştir?', '1923']
            ];
        }

        // Excel çalışma kitabı oluştur
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Çalışma sayfasını çalışma kitabına ekle
        const fileName = questionType === 'true_false'
            ? 'dogru-yanlis-sorular-sablonu.xlsx'
            : 'klasik-sorular-sablonu.xlsx';

        XLSX.utils.book_append_sheet(wb, ws, questionType === 'true_false' ? 'Doğru-Yanlış Sorular' : 'Klasik Sorular');

        // Dosyayı indir
        XLSX.writeFile(wb, fileName);
    };

    // Dosya seçimini temizle
    const handleClearFile = () => {
        setSelectedFile(null);
        setQuestions([]);
        setParseError(null);
        setGlobalError(null);
        setSuccess(false);
        setStats({
            total: 0,
            valid: 0,
            invalid: 0,
            saved: 0,
            failed: 0
        });
    };

    // Kategorinin seçili olup olmadığını kontrol et
    const isCategorySelected = categoryId !== '';

    // Yardım diyaloğunu aç
    const handleOpenHelpDialog = () => {
        setHelpDialogOpen(true);
    };

    // Yardım diyaloğunu kapat
    const handleCloseHelpDialog = () => {
        setHelpDialogOpen(false);
    };

    const handleCategoryChange = (event: SelectChangeEvent<number | string>) => {
        setCategoryId(event.target.value as number);
    };

    const handleQuestionTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionType(event.target.value as 'true_false' | 'text');
    };

    return (
        <Box sx={{
            width: '100%',
            px: 3,
            boxSizing: 'border-box'
        }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Excel ile Soru Ekle
                <IconButton color="primary" onClick={handleOpenHelpDialog} sx={{ ml: 1, mb: 1 }}>
                    <HelpIcon />
                </IconButton>
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Kategori ve Soru Tipi Seçimi
                </Typography>

                <FormControl fullWidth required sx={{ mb: 3, maxWidth: 400 }}>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                        value={categoryId}
                        label="Kategori"
                        onChange={handleCategoryChange}
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

                <FormControl component="fieldset" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Soru Tipi
                    </Typography>
                    <RadioGroup
                        row
                        value={questionType}
                        onChange={handleQuestionTypeChange}
                    >
                        <FormControlLabel
                            value="true_false"
                            control={<Radio />}
                            label="Doğru/Yanlış"
                        />
                        <FormControlLabel
                            value="text"
                            control={<Radio />}
                            label="Klasik"
                        />
                    </RadioGroup>
                </FormControl>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <FormControl sx={{ minWidth: 150 }} disabled>
                        <InputLabel>Sınıf</InputLabel>
                        <Select value={gradeId} label="Sınıf">
                            {grades.map((grade) => (
                                <MenuItem key={grade.id} value={grade.id}>
                                    {grade.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }} disabled>
                        <InputLabel>Ders</InputLabel>
                        <Select value={subjectId} label="Ders">
                            {subjects.map((subject) => (
                                <MenuItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }} disabled>
                        <InputLabel>Ünite</InputLabel>
                        <Select value={unitId} label="Ünite">
                            {units.map((unit) => (
                                <MenuItem key={unit.id} value={unit.id}>
                                    {unit.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }} disabled>
                        <InputLabel>Konu</InputLabel>
                        <Select value={topicId} label="Konu">
                            {topics.map((topic) => (
                                <MenuItem key={topic.id} value={topic.id}>
                                    {topic.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Chip
                        label={questionType === 'true_false' ? 'Doğru-Yanlış Soruları' : 'Klasik Sorular'}
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {questionType === 'true_false' ? (
                            'Excel dosyasında her soru için doğru cevap "Doğru" veya "Yanlış" olarak belirtilmelidir.'
                        ) : (
                            'Excel dosyasında her soru için cevap metni "Cevap" sütununda belirtilmelidir.'
                        )}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 3 }}>
                    Excel Dosyası Seçimi
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadTemplate}
                    >
                        Örnek Şablon İndir
                    </Button>

                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<FileUploadIcon />}
                        disabled={!isCategorySelected}
                    >
                        Excel Dosyası Seç
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>

                    {selectedFile && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleClearFile}
                        >
                            Dosyayı Temizle
                        </Button>
                    )}
                </Box>

                {!isCategorySelected && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Lütfen önce bir kategori seçin.
                    </Alert>
                )}

                {parseError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {parseError}
                    </Alert>
                )}

                {globalError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {globalError}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {stats.saved} soru başarıyla kaydedildi!
                        {stats.failed > 0 && ` (${stats.failed} soru kaydedilemedi)`}
                    </Alert>
                )}

                {loading && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Excel dosyası işleniyor...
                        </Typography>
                        <LinearProgress />
                    </Box>
                )}

                {selectedFile && !loading && questions.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Dosya: {selectedFile.name}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                            <Chip
                                label={`Toplam: ${stats.total}`}
                                color="default"
                            />
                            <Chip
                                label={`Geçerli: ${stats.valid}`}
                                color="success"
                                icon={<CheckCircleIcon />}
                            />
                            <Chip
                                label={`Hatalı: ${stats.invalid}`}
                                color="error"
                                icon={<ErrorIcon />}
                            />
                        </Box>

                        <TableContainer sx={{ maxHeight: 400, overflow: 'auto', mb: 3 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="5%">#</TableCell>
                                        <TableCell width="55%">Soru Metni</TableCell>
                                        <TableCell width="30%">
                                            {questionType === 'true_false' ? 'Doğru Cevap' : 'Cevap'}
                                        </TableCell>
                                        <TableCell width="10%">Durum</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {questions.map((question) => (
                                        <TableRow
                                            key={question.id}
                                            sx={{
                                                backgroundColor: question.valid ? 'inherit' : '#fff8f8',
                                                '&:hover': {
                                                    backgroundColor: question.valid ? '#f5f5f5' : '#fff0f0',
                                                }
                                            }}
                                        >
                                            <TableCell>{question.id}</TableCell>
                                            <TableCell>
                                                <Tooltip title={question.error || ''} placement="top">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            textDecoration: question.valid ? 'none' : 'line-through',
                                                            color: question.valid ? 'inherit' : 'text.disabled'
                                                        }}
                                                    >
                                                        {question.question_text}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                {questionType === 'true_false' ? (
                                                    question.is_correct === true ? 'Doğru' : 'Yanlış'
                                                ) : (
                                                    question.answer_text
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {question.valid ? (
                                                    <Chip
                                                        label="Geçerli"
                                                        color="success"
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Tooltip title={question.error || 'Geçersiz'}>
                                                        <Chip
                                                            label="Hata"
                                                            color="error"
                                                            size="small"
                                                        />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/questions')}
                                disabled={saving}
                            >
                                İptal
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                onClick={handleSaveQuestions}
                                disabled={saving || stats.valid === 0 || success}
                            >
                                {saving ? 'Kaydediliyor...' : 'Soruları Kaydet'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* Yardım Diyaloğu */}
            <Dialog
                open={helpDialogOpen}
                onClose={handleCloseHelpDialog}
                maxWidth="md"
            >
                <DialogTitle>
                    Excel ile Soru Yükleme Hakkında
                    <IconButton
                        onClick={handleCloseHelpDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText component="div">
                        <Typography variant="h6" gutterBottom>
                            Excel Formatı Nasıl Olmalı?
                        </Typography>

                        <Typography paragraph>
                            Excel dosyanız aşağıdaki özelliklere sahip olmalıdır:
                        </Typography>

                        <ul>
                            <li>
                                <Typography>
                                    İlk satır <strong>başlık satırı</strong> olmalıdır.
                                </Typography>
                            </li>
                            <li>
                                <Typography>
                                    <strong>"Soru Metni"</strong> adında bir sütun içermelidir.
                                </Typography>
                            </li>
                            <li>
                                <Typography>
                                    {questionType === 'true_false' ? (
                                        <span><strong>"Doğru/Yanlış"</strong> adında bir sütun içermelidir.</span>
                                    ) : (
                                        <span><strong>"Cevap"</strong> adında bir sütun içermelidir.</span>
                                    )}
                                </Typography>
                            </li>
                        </ul>

                        {questionType === 'true_false' && (
                            <>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Doğru/Yanlış Sütunu Nasıl Doldurulmalı?
                                </Typography>

                                <Typography paragraph>
                                    Doğru/Yanlış sütununda aşağıdaki değerler kabul edilir:
                                </Typography>

                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Doğru için kabul edilen değerler</strong></TableCell>
                                                <TableCell><strong>Yanlış için kabul edilen değerler</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Doğru, Dogru, True, D, T, Evet, Yes, 1</TableCell>
                                                <TableCell>Yanlış, Yanlis, False, Y, F, Hayır, Hayir, No, 0</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}

                        {questionType === 'text' && (
                            <>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Klasik Sorularda Cevap Sütunu
                                </Typography>

                                <Typography paragraph>
                                    "Cevap" sütununda sorunun doğru cevabını belirtmelisiniz. Bu metin öğrencilere gösterilecek doğru cevaptır.
                                </Typography>
                            </>
                        )}

                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Örnek Excel Şablonu
                        </Typography>

                        <Typography paragraph>
                            Doğru formatta bir Excel dosyası oluşturmak için "Örnek Şablon İndir" düğmesini kullanabilirsiniz.
                            İndirilen şablonu doldurduktan sonra yükleyebilirsiniz.
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Hata ve Uyarılar
                        </Typography>

                        <Typography paragraph>
                            Yüklenen dosyadaki sorunlu satırlar kırmızı olarak işaretlenir ve hata nedeni gösterilir.
                            Sadece geçerli olarak işaretlenen sorular kaydedilecektir.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseHelpDialog}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExcelSoruImport;