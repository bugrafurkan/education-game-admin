// src/pages/questions/QuestionList.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    TablePagination, Chip, IconButton, Grid, MenuItem, Select, FormControl,
    InputLabel, SelectChangeEvent, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, CircularProgress, Alert, Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useQuestions } from '../../hooks/useQuestions';
import { Category, QuestionFilter } from '../../services/question.service';
import { useCategories } from '../../hooks/useCategories';

const QuestionList = () => {
    const [page, setPage] = useState(0); // Material-UI pagination 0-based
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    // Kategori filtreleri için state'ler
    const [gradeFilter, setGradeFilter] = useState<string>('');
    const [subjectFilter, setSubjectFilter] = useState<string>('');
    const [unitFilter, setUnitFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    // Kategorileri ve filtrelenmiş kategorileri almak için hook'lar
    const { categories, loading: categoriesLoading } = useCategories();

    // Filtreleme için unique değerleri tutacak state'ler
    const [grades, setGrades] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

    // API filtreleri
    const filters: QuestionFilter = {
        search: searchText || undefined,
        type: typeFilter || undefined,
        difficulty: difficultyFilter || undefined,
        category_id: categoryFilter || undefined
    };

    // Hook ile soruları yükle
    const { questions, loading, error, pagination, fetchPage, deleteQuestion } = useQuestions(page + 1, filters);

    // Kategori filtreleme bilgilerini yükle
    useEffect(() => {
        if (categories.length > 0) {
            // Tüm unique sınıfları bul
            const uniqueGrades = Array.from(new Set(categories.map(cat => cat.grade))).filter(Boolean);
            setGrades(uniqueGrades as string[]);
        }
    }, [categories]);

    // Sınıf değiştiğinde dersleri filtrele
    useEffect(() => {
        if (categories.length > 0 && gradeFilter) {
            // Seçilen sınıfa göre dersleri filtrele
            const filteredSubjects = Array.from(
                new Set(
                    categories
                        .filter(cat => cat.grade === gradeFilter)
                        .map(cat => cat.subject)
                )
            ).filter(Boolean);

            setSubjects(filteredSubjects as string[]);
            setSubjectFilter(''); // Sınıf değiştiğinde ders filtresini sıfırla
            setUnitFilter(''); // Sınıf değiştiğinde ünite filtresini sıfırla
            setCategoryFilter(''); // Sınıf değiştiğinde kategori filtresini sıfırla
        } else {
            setSubjects([]);
        }
    }, [categories, gradeFilter]);

    // Ders değiştiğinde üniteleri filtrele
    useEffect(() => {
        if (categories.length > 0 && gradeFilter && subjectFilter) {
            // Seçilen sınıf ve derse göre üniteleri filtrele
            const filteredUnits = Array.from(
                new Set(
                    categories
                        .filter(cat => cat.grade === gradeFilter && cat.subject === subjectFilter)
                        .map(cat => cat.unit)
                )
            ).filter(Boolean);

            setUnits(filteredUnits as string[]);
            setUnitFilter(''); // Ders değiştiğinde ünite filtresini sıfırla
            setCategoryFilter(''); // Ders değiştiğinde kategori filtresini sıfırla
        } else {
            setUnits([]);
        }
    }, [categories, gradeFilter, subjectFilter]);

    // Ünite değiştiğinde kategorileri filtrele
    useEffect(() => {
        if (categories.length > 0 && gradeFilter && subjectFilter) {
            let filtered = categories.filter(
                cat => cat.grade === gradeFilter && cat.subject === subjectFilter
            );

            if (unitFilter) {
                filtered = filtered.filter(cat => cat.unit === unitFilter);
            }

            setFilteredCategories(filtered);
            setCategoryFilter(''); // Ünite değiştiğinde kategori filtresini sıfırla
        } else {
            setFilteredCategories([]);
        }
    }, [categories, gradeFilter, subjectFilter, unitFilter]);

    // Filtre değişikliklerini yönet
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleTypeChange = (event: SelectChangeEvent) => {
        setTypeFilter(event.target.value);
        setPage(0); // Filtre değiştiğinde ilk sayfaya dön
        fetchPage(1); // API 1-based
    };

    const handleDifficultyChange = (event: SelectChangeEvent) => {
        setDifficultyFilter(event.target.value);
        setPage(0);
        fetchPage(1);
    };

    // Kategori filtre değişikliklerini yönet
    const handleGradeChange = (event: SelectChangeEvent) => {
        setGradeFilter(event.target.value);
        setPage(0);
        fetchPage(1);
    };

    const handleSubjectChange = (event: SelectChangeEvent) => {
        setSubjectFilter(event.target.value);
        setPage(0);
        fetchPage(1);
    };

    const handleUnitChange = (event: SelectChangeEvent) => {
        setUnitFilter(event.target.value);
        setPage(0);
        fetchPage(1);
    };

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategoryFilter(event.target.value);
        setPage(0);
        fetchPage(1);
    };

    // Tüm filtreleri sıfırla
    const handleResetFilters = () => {
        setSearchText('');
        setTypeFilter('');
        setDifficultyFilter('');
        setGradeFilter('');
        setSubjectFilter('');
        setUnitFilter('');
        setCategoryFilter('');
        setPage(0);
        fetchPage(1);
    };

    // Arama butonuna tıklandığında
    const handleSearch = () => {
        setPage(0);
        fetchPage(1);
    };

    // Sayfalama işlemleri
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
        fetchPage(newPage + 1); // API 1-based, Material-UI 0-based
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        parseInt(event.target.value, 10);
// Backend'e yeni per_page değeriyle istek gönder
        fetchPage(1); // İlk sayfaya dön
        setPage(0);
    };

    // Silme işlemleri
    const handleDeleteClick = (questionId: number) => {
        setQuestionToDelete(questionId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (questionToDelete === null) return;

        const success = await deleteQuestion(questionToDelete);
        if (success) {
            setDeleteDialogOpen(false);
            setQuestionToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setQuestionToDelete(null);
    };

    // Soru tipini Türkçe olarak gösterme
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

    // Zorluk seviyesini Türkçe olarak gösterme ve renklendirme
    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return { label: 'Kolay', color: 'success' as const };
            case 'medium':
                return { label: 'Orta', color: 'warning' as const };
            case 'hard':
                return { label: 'Zor', color: 'error' as const };
            default:
                return { label: difficulty, color: 'default' as const };
        }
    };

    // Herhangi bir filtre aktif mi kontrol et
    const isAnyFilterActive = () => {
        return searchText || typeFilter || difficultyFilter || gradeFilter || subjectFilter || unitFilter || categoryFilter;
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Soru Yönetimi
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Soru Ara"
                            variant="outlined"
                            value={searchText}
                            onChange={handleSearchChange}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button onClick={handleSearch}>Ara</Button>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Soru Tipi</InputLabel>
                            <Select
                                value={typeFilter}
                                label="Soru Tipi"
                                onChange={handleTypeChange}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                <MenuItem value="multiple_choice">Çoktan Seçmeli</MenuItem>
                                <MenuItem value="true_false">Doğru-Yanlış</MenuItem>
                                <MenuItem value="qa">Klasik</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Zorluk</InputLabel>
                            <Select
                                value={difficultyFilter}
                                label="Zorluk"
                                onChange={handleDifficultyChange}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                <MenuItem value="easy">Kolay</MenuItem>
                                <MenuItem value="medium">Orta</MenuItem>
                                <MenuItem value="hard">Zor</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/questions/add"
                            sx={{
                                py: 1.5,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                        >
                            Yeni Soru Ekle
                        </Button>
                    </Grid>

                    {/* Kategori Filtreleri */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FilterIcon sx={{ mr: 1 }} />
                            <Typography variant="subtitle1">Kategori Filtreleri</Typography>
                            {isAnyFilterActive() && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={handleResetFilters}
                                    sx={{ ml: 2 }}
                                >
                                    Filtreleri Temizle
                                </Button>
                            )}
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Sınıf</InputLabel>
                                    <Select
                                        value={gradeFilter}
                                        label="Sınıf"
                                        onChange={handleGradeChange}
                                    >
                                        <MenuItem value="">Tümü</MenuItem>
                                        {categoriesLoading ? (
                                            <MenuItem disabled>Yükleniyor...</MenuItem>
                                        ) : (
                                            grades.map((grade) => (
                                                <MenuItem key={grade} value={grade}>
                                                    {grade}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small" disabled={!gradeFilter}>
                                    <InputLabel>Ders</InputLabel>
                                    <Select
                                        value={subjectFilter}
                                        label="Ders"
                                        onChange={handleSubjectChange}
                                    >
                                        <MenuItem value="">Tümü</MenuItem>
                                        {subjects.map((subject) => (
                                            <MenuItem key={subject} value={subject}>
                                                {subject}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small" disabled={!subjectFilter}>
                                    <InputLabel>Ünite</InputLabel>
                                    <Select
                                        value={unitFilter}
                                        label="Ünite"
                                        onChange={handleUnitChange}
                                    >
                                        <MenuItem value="">Tümü</MenuItem>
                                        {units.map((unit) => (
                                            <MenuItem key={unit} value={unit}>
                                                {unit}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small" disabled={!subjectFilter}>
                                    <InputLabel>Kategori</InputLabel>
                                    <Select
                                        value={categoryFilter}
                                        label="Kategori"
                                        onChange={handleCategoryChange}
                                    >
                                        <MenuItem value="">Tümü</MenuItem>
                                        {filteredCategories.map((category) => (
                                            <MenuItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f8fa' }}>
                            <TableRow>
                                <TableCell width="5%">#</TableCell>
                                <TableCell width="7%">Resim</TableCell>
                                <TableCell width="28%">Soru</TableCell>
                                <TableCell width="13%">Soru Tipi</TableCell>
                                <TableCell width="8%">Zorluk</TableCell>
                                <TableCell width="12%">Kategori</TableCell>
                                <TableCell width="12%">Ekleyen</TableCell>
                                <TableCell width="15%">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : questions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        Soru bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                questions.map((question) => (
                                    <TableRow key={question.id} hover>
                                        <TableCell>{question.id}</TableCell>
                                        <TableCell>
                                            {question.image_path ? (
                                                <img
                                                    src={question.image_path}
                                                    alt="Soru resmi"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        width: '50px',
                                                        height: '50px',
                                                        bgcolor: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        color: '#999'
                                                    }}
                                                >
                                                    N/A
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell>{question.question_text}</TableCell>
                                        <TableCell>{getQuestionTypeLabel(question.question_type)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getDifficultyLabel(question.difficulty).label}
                                                color={getDifficultyLabel(question.difficulty).color}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={
                                                question.category ?
                                                    `${question.category.grade || '-'} / ${question.category.subject || '-'} / ${question.category.unit || '-'}` :
                                                    'Kategori bilgisi yok'
                                            }>
                                                <span>{question.category?.name || '-'}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            {question.user ? (
                                                <Tooltip title={question.user.email}>
                                                    <span>{question.user.name}</span>
                                                </Tooltip>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                title="Görüntüle"
                                                component={Link}
                                                to={`/questions/${question.id}`}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                            <IconButton
                                                color="info"
                                                title="Düzenle"
                                                component={Link}
                                                to={`/questions/${question.id}/edit`}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                title="Sil"
                                                onClick={() => handleDeleteClick(question.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {!loading && pagination && (
                    <TablePagination
                        rowsPerPageOptions={[10, 20, 50]}
                        component="div"
                        count={pagination.total}
                        rowsPerPage={pagination.per_page}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Sayfa başına satır:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                    />
                )}
            </Paper>

            {/* Silme Onay Dialogu */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Soruyu Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu soruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={loading}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionList;