// src/pages/questions/QuestionList.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    TablePagination, Chip, IconButton, Grid, MenuItem, Select, FormControl,
    InputLabel, SelectChangeEvent, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, CircularProgress, Alert, Tooltip,
    Stack, Container
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useQuestions } from '../../hooks/useQuestions';
import { QuestionFilter, Category } from '../../services/question.service';
import { useCategories } from '../../hooks/useCategories';
import { useUsers } from '../../hooks/useUsers';

const QuestionList = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
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
    const { categories } = useCategories();

    const { users } = useUsers();
    const [userFilter, setUserFilter] = useState<string>('');

    // Filtreleme için unique değerleri tutacak state'ler
    const [grades, setGrades] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

    // API filtreleri
    const filters: QuestionFilter = {
        search: search || undefined,
        type: typeFilter || undefined,
        difficulty: difficultyFilter || undefined,
        user_id: userFilter ? Number(userFilter) : undefined,
        grade: gradeFilter || undefined,
        subject: subjectFilter || undefined,
        unit: unitFilter || undefined,
        konu: categoryFilter
            ? filteredCategories.find(cat => cat.id.toString() === categoryFilter)?.description
            : undefined,
    };

    // Hook ile soruları yükle
    const { questions, loading, error, pagination, deleteQuestion } = useQuestions(page, filters);

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
        setSearch(e.target.value);
        setPage(1); // Filtreleme yapıldığında ilk sayfaya dön
    };

    const handleTypeChange = (event: SelectChangeEvent) => {
        setTypeFilter(event.target.value);
        setPage(1);
    };

    const handleDifficultyChange = (event: SelectChangeEvent) => {
        setDifficultyFilter(event.target.value);
        setPage(1);
    };

    // Kategori filtre değişikliklerini yönet
    const handleGradeChange = (event: SelectChangeEvent) => {
        setGradeFilter(event.target.value);
        setPage(1);
    };

    const handleSubjectChange = (event: SelectChangeEvent) => {
        setSubjectFilter(event.target.value);
        setPage(1);
    };

    const handleUnitChange = (event: SelectChangeEvent) => {
        setUnitFilter(event.target.value);
        setPage(1);
    };

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategoryFilter(event.target.value);
        setPage(1);
    };

    // Tüm filtreleri sıfırla
    const handleResetFilters = () => {
        setSearch('');
        setTypeFilter('');
        setDifficultyFilter('');
        setGradeFilter('');
        setSubjectFilter('');
        setUnitFilter('');
        setCategoryFilter('');
        setPage(1);
    };

    // Sayfalama işlemleri
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage + 1); // Material-UI sayfalama 0-tabanlı, API'miz 1-tabanlı
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
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
        return search || typeFilter || difficultyFilter || gradeFilter || subjectFilter || unitFilter || categoryFilter;
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, my: 3 }}>
                {/* Başlık ve Yeni Soru Ekle Butonu */}
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MenuBookIcon color="primary" sx={{ fontSize: 30 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Soru Havuzu
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Button
                                variant="contained"
                                size="medium"
                                startIcon={<AddIcon />}
                                component={Link}
                                to="/questions/add"
                                sx={{ fontSize: '0.9rem', py: 1.2 }}
                            >
                                Yeni Soru Ekle
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Filtreler */}
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                        Filtreler
                    </Typography>
                    <Grid container spacing={2}>
                        {/* Arama */}
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Soru Ara"
                                variant="outlined"
                                value={search}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Kullanıcı */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Kullanıcı</InputLabel>
                                <Select
                                    value={userFilter}
                                    label="Kullanıcı"
                                    onChange={(e) => setUserFilter(e.target.value)}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    {users.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Soru Tipi */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Soru Tipi</InputLabel>
                                <Select value={typeFilter} label="Soru Tipi" onChange={handleTypeChange}>
                                    <MenuItem value="">Tümü</MenuItem>
                                    <MenuItem value="multiple_choice">Çoktan Seçmeli</MenuItem>
                                    <MenuItem value="true_false">Doğru-Yanlış</MenuItem>
                                    <MenuItem value="qa">Klasik</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Zorluk */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Zorluk</InputLabel>
                                <Select value={difficultyFilter} label="Zorluk" onChange={handleDifficultyChange}>
                                    <MenuItem value="">Tümü</MenuItem>
                                    <MenuItem value="easy">Kolay</MenuItem>
                                    <MenuItem value="medium">Orta</MenuItem>
                                    <MenuItem value="hard">Zor</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Sınıf */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Sınıf</InputLabel>
                                <Select value={gradeFilter} label="Sınıf" onChange={handleGradeChange}>
                                    <MenuItem value="">Tümü</MenuItem>
                                    {grades.map((grade) => (
                                        <MenuItem key={grade} value={grade}>
                                            {grade}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Ders */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Ders</InputLabel>
                                <Select value={subjectFilter} label="Ders" onChange={handleSubjectChange}>
                                    <MenuItem value="">Tümü</MenuItem>
                                    {subjects.map((subject) => (
                                        <MenuItem key={subject} value={subject}>
                                            {subject}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Ünite */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Ünite</InputLabel>
                                <Select value={unitFilter} label="Ünite" onChange={handleUnitChange}>
                                    <MenuItem value="">Tümü</MenuItem>
                                    {units.map((unit) => (
                                        <MenuItem key={unit} value={unit}>
                                            {unit}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Konu */}
                        <Grid item xs={12} sm={6} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Konu</InputLabel>
                                <Select
                                    value={categoryFilter}
                                    label="Konu"
                                    onChange={handleCategoryChange}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    {filteredCategories.map((category) => (
                                        <MenuItem key={category.id} value={category.id.toString()}>
                                            {category.description || category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Filtre Temizle */}
                        {isAnyFilterActive() && (
                            <Grid item xs={12} sm={6} md={6}>
                                <Button
                                    variant="outlined"
                                    size="medium"
                                    color="error"
                                    onClick={handleResetFilters}
                                >
                                    Filtreleri Temizle
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Paper>

                {/* Hata mesajı */}
                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                {/* Soru tablosu */}
                <Paper sx={{ borderRadius: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f8fa' }}>
                                <TableRow>
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
                                            <TableCell sx={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {question.question_text}
                                            </TableCell>
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
                                                ) : (
                                                    <Chip label="Bilinmiyor" size="small" variant="outlined" color="default" />
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="Düzenle">
                                                        <IconButton color="info" component={Link} to={`/questions/${question.id}/edit`}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Sil">
                                                        <IconButton color="error" onClick={() => handleDeleteClick(question.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {!loading && pagination && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={pagination.total}
                            rowsPerPage={rowsPerPage}
                            page={pagination.current_page - 1} // API'den 1-tabanlı, MUI'de 0-tabanlı
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Sayfa başına satır:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                        />
                    )}
                </Paper>
            </Box>

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
        </Container>
    );
};

export default QuestionList;