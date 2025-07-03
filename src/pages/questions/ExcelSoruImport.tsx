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
import { usePublishers } from '../../hooks/usePublishers';
import * as questionService from '../../services/question.service';
import * as gameService from '../../services/game.service';
import * as categoryService from '../../services/category.service';
import * as XLSX from 'xlsx';

interface ExcelQuestion {
    id: number;
    question_text: string;
    is_correct?: boolean;
    answer_text?: string;
    // Çoktan seçmeli için seçenekler
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_option?: string;
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

    // Manuel seçim alanları
    const [gradeId, setGradeId] = useState<number | ''>('');
    const [subjectId, setSubjectId] = useState<number | ''>('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [topicId, setTopicId] = useState<number | ''>('');

    // Kategori durumu
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [categoryExists, setCategoryExists] = useState<boolean>(false);
    const [creatingCategory, setCreatingCategory] = useState<boolean>(false);

    // Filtrelenmiş listeler
    const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<any[]>([]);

    // Soru tipi ve yayınevi seçimi
    const [questionType, setQuestionType] = useState<'true_false' | 'text' | 'multiple_choice'>('true_false');
    const [publisherName, setPublisherName] = useState<string>('');

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
    const { categories, refreshCategories } = useCategories();
    const { publishers } = usePublishers();

    // Grade ve Subject değiştiğinde ilgili üniteleri filtrele
    useEffect(() => {
        if (gradeId && subjectId) {
            const filtered = units.filter(
                unit => unit.grade_id === gradeId && unit.subject_id === subjectId
            );
            setFilteredUnits(filtered);

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
        if (gradeId && subjectId && unitId && topicId) {
            const matchingCategory = categories.find(category =>
                category.grade_id === gradeId &&
                category.subject_id === subjectId &&
                category.unit_id === unitId &&
                category.topic_id === topicId
            );

            if (matchingCategory) {
                setCategoryExists(true);
                setCategoryId(matchingCategory.id);
            } else {
                setCategoryExists(false);
                setCategoryId('');
            }
        } else {
            setCategoryExists(false);
            setCategoryId('');
        }
    }, [gradeId, subjectId, unitId, topicId, categories]);

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

                let requiredColumns: string[] = [];
                let columnIndices: { [key: string]: number } = {};

                if (questionType === 'true_false') {
                    // Doğru/Yanlış tipi için gerekli sütunlar
                    const answerColIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('doğru') ||
                        h?.toString().toLowerCase().includes('yanlış') ||
                        h?.toString().toLowerCase().includes('dogru') ||
                        h?.toString().toLowerCase().includes('yanlis') ||
                        h?.toString().toLowerCase().includes('true') ||
                        h?.toString().toLowerCase().includes('false'));

                    columnIndices = { question: questionColIndex, answer: answerColIndex };
                    requiredColumns = ['Soru Metni', 'Doğru/Yanlış'];

                } else if (questionType === 'text') {
                    // Klasik tipi için gerekli sütunlar
                    const answerColIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('cevap') ||
                        h?.toString().toLowerCase().includes('answer'));

                    columnIndices = { question: questionColIndex, answer: answerColIndex };
                    requiredColumns = ['Soru Metni', 'Cevap'];

                } else if (questionType === 'multiple_choice') {
                    // Çoktan seçmeli tipi için gerekli sütunlar
                    const optionAIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('seçenek a') ||
                        h?.toString().toLowerCase().includes('secenek a') ||
                        h?.toString().toLowerCase().includes('option a') ||
                        h?.toString().toLowerCase().includes('a)') ||
                        h?.toString().toLowerCase().includes('a şıkkı') ||
                        h?.toString().toLowerCase().includes('a sikki'));

                    const optionBIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('seçenek b') ||
                        h?.toString().toLowerCase().includes('secenek b') ||
                        h?.toString().toLowerCase().includes('option b') ||
                        h?.toString().toLowerCase().includes('b)') ||
                        h?.toString().toLowerCase().includes('b şıkkı') ||
                        h?.toString().toLowerCase().includes('b sikki'));

                    const optionCIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('seçenek c') ||
                        h?.toString().toLowerCase().includes('secenek c') ||
                        h?.toString().toLowerCase().includes('option c') ||
                        h?.toString().toLowerCase().includes('c)') ||
                        h?.toString().toLowerCase().includes('c şıkkı') ||
                        h?.toString().toLowerCase().includes('c sikki'));

                    const optionDIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('seçenek d') ||
                        h?.toString().toLowerCase().includes('secenek d') ||
                        h?.toString().toLowerCase().includes('option d') ||
                        h?.toString().toLowerCase().includes('d)') ||
                        h?.toString().toLowerCase().includes('d şıkkı') ||
                        h?.toString().toLowerCase().includes('d sikki'));

                    const correctOptionIndex = headers.findIndex((h: string) =>
                        h?.toString().toLowerCase().includes('doğru seçenek') ||
                        h?.toString().toLowerCase().includes('dogru secenek') ||
                        h?.toString().toLowerCase().includes('correct option') ||
                        h?.toString().toLowerCase().includes('doğru şık') ||
                        h?.toString().toLowerCase().includes('dogru sik') ||
                        h?.toString().toLowerCase().includes('cevap'));

                    columnIndices = {
                        question: questionColIndex,
                        optionA: optionAIndex,
                        optionB: optionBIndex,
                        optionC: optionCIndex,
                        optionD: optionDIndex,
                        correctOption: correctOptionIndex
                    };
                    requiredColumns = ['Soru Metni', 'Seçenek A', 'Seçenek B', 'Seçenek C', 'Seçenek D', 'Doğru Seçenek'];
                }

                // Eksik sütunları kontrol et
                const missingColumns = Object.values(columnIndices).filter(index => index === -1);
                if (missingColumns.length > 0) {
                    setParseError(`Excel dosyasında gerekli sütunlar bulunamadı. Lütfen şu sütunların bulunduğundan emin olun: ${requiredColumns.join(', ')}`);
                    setLoading(false);
                    return;
                }

                // Verileri doğrula ve işle
                const parsedQuestions: ExcelQuestion[] = [];
                let counter = 0;

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];

                    // Boş satırları atla
                    if (!row || row.length === 0 || !row[columnIndices.question]) continue;

                    const questionText = row[columnIndices.question]?.toString().trim();
                    let valid = true;
                    let error = undefined;
                    let isCorrect: boolean | undefined = undefined;
                    let answerText: string | undefined = undefined;
                    let optionA: string | undefined = undefined;
                    let optionB: string | undefined = undefined;
                    let optionC: string | undefined = undefined;
                    let optionD: string | undefined = undefined;
                    let correctOption: string | undefined = undefined;

                    // Soru tipine göre farklı işlem yap
                    if (questionType === 'true_false') {
                        // Doğru/Yanlış değerini işle
                        if (row[columnIndices.answer]) {
                            const answerValue = row[columnIndices.answer]?.toString().toLowerCase().trim();

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

                    } else if (questionType === 'text') {
                        // Klasik soru için cevap metnini kontrol et
                        answerText = row[columnIndices.answer]?.toString().trim();
                        if (!answerText || answerText.length < 1) {
                            valid = false;
                            error = 'Cevap metni eksik';
                        }

                    } else if (questionType === 'multiple_choice') {
                        // Çoktan seçmeli için seçenekleri ve doğru cevabı kontrol et
                        optionA = row[columnIndices.optionA]?.toString().trim();
                        optionB = row[columnIndices.optionB]?.toString().trim();
                        optionC = row[columnIndices.optionC]?.toString().trim();
                        optionD = row[columnIndices.optionD]?.toString().trim();
                        correctOption = row[columnIndices.correctOption]?.toString().toLowerCase().trim();

                        // Seçeneklerin dolu olup olmadığını kontrol et
                        if (!optionA || !optionB || !optionC || !optionD) {
                            valid = false;
                            error = 'Tüm seçenekler (A, B, C, D) doldurulmalıdır';
                        }
                        // Doğru seçeneği kontrol et
                        else if (!correctOption || !['a', 'b', 'c', 'd'].includes(correctOption)) {
                            valid = false;
                            error = 'Doğru seçenek A, B, C veya D olmalıdır';
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
                        option_a: optionA,
                        option_b: optionB,
                        option_c: optionC,
                        option_d: optionD,
                        correct_option: correctOption,
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

    // Soruları kaydet ve tüm oyunlara ekle
    const handleSaveQuestions = async () => {
        if (!categoryId) {
            setGlobalError('Lütfen bir kategori seçin.');
            return;
        }

        if (!publisherName.trim()) {
            setGlobalError('Lütfen bir yayınevi seçin.');
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
                        publisher: publisherName.trim(),
                        answers: [
                            { answer_text: 'Doğru', is_correct: question.is_correct === true },
                            { answer_text: 'Yanlış', is_correct: question.is_correct === false }
                        ]
                    };
                } else if (questionType === 'text') {
                    // Klasik tipi soru
                    questionData = {
                        category_id: categoryId as number,
                        question_text: question.question_text,
                        question_type: 'qa',
                        difficulty: 'medium',
                        publisher: publisherName.trim(),
                        answers: [
                            { answer_text: question.answer_text || '', is_correct: true }
                        ]
                    };
                } else if (questionType === 'multiple_choice') {
                    // Çoktan seçmeli tipi soru
                    questionData = {
                        category_id: categoryId as number,
                        question_text: question.question_text,
                        question_type: 'multiple_choice',
                        difficulty: 'medium',
                        publisher: publisherName.trim(),
                        answers: [
                            { answer_text: question.option_a || '', is_correct: question.correct_option === 'a' },
                            { answer_text: question.option_b || '', is_correct: question.correct_option === 'b' },
                            { answer_text: question.option_c || '', is_correct: question.correct_option === 'c' },
                            { answer_text: question.option_d || '', is_correct: question.correct_option === 'd' }
                        ]
                    };
                } else {
                    throw new Error('Geçersiz soru tipi');
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
        } else if (questionType === 'text') {
            data = [
                ['Soru Metni', 'Cevap'],
                ['Türkiye\'nin başkenti neresidir?', 'Ankara'],
                ['2+2 kaçtır?', '4'],
                ['Dünyanın en büyük okyanusu hangisidir?', 'Pasifik Okyanusu'],
                ['Cumhuriyet hangi yılda ilan edilmiştir?', '1923']
            ];
        } else if (questionType === 'multiple_choice') {
            data = [
                ['Soru Metni', 'Seçenek A', 'Seçenek B', 'Seçenek C', 'Seçenek D', 'Doğru Seçenek'],
                ['Türkiye\'nin başkenti neresidir?', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'B'],
                ['2+2 kaçtır?', '3', '4', '5', '6', 'B'],
                ['Dünyanın en büyük okyanusu hangisidir?', 'Atlas Okyanusu', 'Hint Okyanusu', 'Pasifik Okyanusu', 'Arktik Okyanusu', 'C'],
                ['Cumhuriyet hangi yılda ilan edilmiştir?', '1922', '1923', '1924', '1925', 'B']
            ];
        }

        // Excel çalışma kitabı oluştur
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Çalışma sayfasını çalışma kitabına ekle
        let fileName = '';
        let sheetName = '';

        if (questionType === 'true_false') {
            fileName = 'dogru-yanlis-sorular-sablonu.xlsx';
            sheetName = 'Doğru-Yanlış Sorular';
        } else if (questionType === 'text') {
            fileName = 'klasik-sorular-sablonu.xlsx';
            sheetName = 'Klasik Sorular';
        } else if (questionType === 'multiple_choice') {
            fileName = 'coktan-secmeli-sorular-sablonu.xlsx';
            sheetName = 'Çoktan Seçmeli Sorular';
        }

        XLSX.utils.book_append_sheet(wb, ws, sheetName);

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
    const isCategorySelected = categoryExists && publisherName.trim() !== '';

    // Yardım diyaloğunu aç
    const handleOpenHelpDialog = () => {
        setHelpDialogOpen(true);
    };

    // Yardım diyaloğunu kapat
    const handleCloseHelpDialog = () => {
        setHelpDialogOpen(false);
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
            setGlobalError('Sınıf, ders, ünite ve konu seçimi zorunludur.');
            return;
        }

        setCreatingCategory(true);
        setGlobalError(null);

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
            setCategoryId(newCategory.id);
            setCategoryExists(true);

            setGlobalError(null);
        } catch (err) {
            console.error('Error creating category:', err);
            setGlobalError('Kategori oluşturulurken bir hata oluştu.');
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleQuestionTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionType(event.target.value as 'true_false' | 'text' | 'multiple_choice');
    };

    // Çoktan seçmeli soruları görüntülemek için yardımcı fonksiyon
    const renderMultipleChoiceOptions = (question: ExcelQuestion) => {
        return (
            <Box>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                    A) {question.option_a}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                    B) {question.option_b}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                    C) {question.option_c}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                    D) {question.option_d}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'primary.main' }}>
                    Doğru: {question.correct_option?.toUpperCase()}
                </Typography>
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
                Excel ile Soru Ekle
                <IconButton color="primary" onClick={handleOpenHelpDialog} sx={{ ml: 1, mb: 1 }}>
                    <HelpIcon />
                </IconButton>
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Kategori ve Soru Tipi Seçimi
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                    Kategori Seçimi
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'end', mb: 3 }}>
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

                    <FormControl fullWidth sx={{ mb: 2, maxWidth: 200 }}>
                        <InputLabel>Ünite</InputLabel>
                        <Select
                            value={unitId}
                            label="Ünite"
                            onChange={handleUnitChange}
                            disabled={!gradeId || !subjectId || filteredUnits.length === 0}
                        >
                            <MenuItem value="">Ünite Seçin</MenuItem>
                            {filteredUnits.map((unit) => (
                                <MenuItem key={unit.id} value={unit.id}>
                                    {unit.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2, maxWidth: 200 }}>
                        <InputLabel>Konu</InputLabel>
                        <Select
                            value={topicId}
                            label="Konu"
                            onChange={handleTopicChange}
                            disabled={!unitId || filteredTopics.length === 0}
                        >
                            <MenuItem value="">Konu Seçin</MenuItem>
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
                        sx={{ mb: 3 }}
                    >
                        {categoryExists
                            ? `Kategori mevcut: ${generateCategoryName()}`
                            : `Bu kombinasyon için kategori bulunamadı: ${generateCategoryName()}`
                        }
                    </Alert>
                )}

                {/* Yayınevi Seçimi */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Yayınevi Seçimi
                    </Typography>
                    <FormControl fullWidth required sx={{ maxWidth: 300 }}>
                        <InputLabel>Yayınevi</InputLabel>
                        <Select
                            value={publisherName}
                            label="Yayınevi"
                            onChange={(e) => setPublisherName(e.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                        width: 'auto',
                                        minWidth: 200,
                                        zIndex: 1500
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">Yayınevi Seçin</MenuItem>
                            {publishers.map((publisher) => (
                                <MenuItem key={publisher.id} value={publisher.name}>
                                    {publisher.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {!publisherName.trim() && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                Yayınevi seçimi zorunludur
                            </Typography>
                        )}
                    </FormControl>
                </Box>

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
                        <FormControlLabel
                            value="multiple_choice"
                            control={<Radio />}
                            label="Çoktan Seçmeli"
                        />
                    </RadioGroup>
                </FormControl>

                <Box sx={{ mb: 3 }}>
                    <Chip
                        label={
                            questionType === 'true_false'
                                ? 'Doğru-Yanlış Soruları'
                                : questionType === 'text'
                                    ? 'Klasik Sorular'
                                    : 'Çoktan Seçmeli Sorular'
                        }
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {questionType === 'true_false' ? (
                            'Excel dosyasında her soru için doğru cevap "Doğru" veya "Yanlış" olarak belirtilmelidir.'
                        ) : questionType === 'text' ? (
                            'Excel dosyasında her soru için cevap metni "Cevap" sütununda belirtilmelidir.'
                        ) : (
                            'Excel dosyasında her soru için 4 seçenek (A, B, C, D) ve doğru seçenek (A, B, C veya D) belirtilmelidir.'
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
                        Lütfen önce bir kategori ve yayınevi seçin.
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
                                        <TableCell width="45%">Soru Metni</TableCell>
                                        <TableCell width="40%">
                                            {questionType === 'true_false'
                                                ? 'Doğru Cevap'
                                                : questionType === 'text'
                                                    ? 'Cevap'
                                                    : 'Seçenekler'
                                            }
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
                                                ) : questionType === 'text' ? (
                                                    question.answer_text
                                                ) : (
                                                    renderMultipleChoiceOptions(question)
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
                                    ) : questionType === 'text' ? (
                                        <span><strong>"Cevap"</strong> adında bir sütun içermelidir.</span>
                                    ) : (
                                        <span><strong>"Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"</strong> ve <strong>"Doğru Seçenek"</strong> sütunları içermelidir.</span>
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

                        {questionType === 'multiple_choice' && (
                            <>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Çoktan Seçmeli Sorularda Sütun Formatı
                                </Typography>

                                <Typography paragraph>
                                    Çoktan seçmeli sorular için aşağıdaki sütunlar gereklidir:
                                </Typography>

                                <ul>
                                    <li><Typography><strong>Seçenek A:</strong> İlk seçenek metni</Typography></li>
                                    <li><Typography><strong>Seçenek B:</strong> İkinci seçenek metni</Typography></li>
                                    <li><Typography><strong>Seçenek C:</strong> Üçüncü seçenek metni</Typography></li>
                                    <li><Typography><strong>Seçenek D:</strong> Dördüncü seçenek metni</Typography></li>
                                    <li><Typography><strong>Doğru Seçenek:</strong> A, B, C veya D harflerinden biri</Typography></li>
                                </ul>

                                <Typography paragraph sx={{ mt: 2 }}>
                                    <strong>Örnek:</strong> Eğer doğru cevap "Seçenek B" ise, "Doğru Seçenek" sütununa sadece "B" yazın.
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