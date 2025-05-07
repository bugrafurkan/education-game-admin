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
    MenuBook as MenuBookIcon,
    ViewList as ViewListIcon,
    FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useQuestions } from '../../hooks/useQuestions';
import { QuestionFilter } from '../../services/question.service';
import { useEducationStructure } from '../../hooks/useEducationStructure';
import { useUsers } from '../../hooks/useUsers';
import { useCategories } from "../../hooks/useCategories";

const QuestionList = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    // Eğitim yapısı verilerini yükle
    const { grades, subjects, units, topics} = useEducationStructure();

    // Kategori filtreleri için state'ler - ID bazlı
    const [gradeIdFilter, setGradeIdFilter] = useState<number | ''>('');
    const [subjectIdFilter, setSubjectIdFilter] = useState<number | ''>('');
    const [unitIdFilter, setUnitIdFilter] = useState<number | ''>('');
    const [topicIdFilter, setTopicIdFilter] = useState<number | ''>('');
    const [categoryIdFilter, setCategoryIdFilter] = useState<number | ''>('');

    const { users } = useUsers();
    const [userFilter, setUserFilter] = useState<string>('');
    const { categories } = useCategories();

    // API filtreleri
    const filters: QuestionFilter = {
        search: search || undefined,
        type: typeFilter || undefined,
        difficulty: difficultyFilter || undefined,
        user_id: userFilter ? Number(userFilter) : undefined,
        grade_id: gradeIdFilter ? Number(gradeIdFilter) : undefined,
        subject_id: subjectIdFilter ? Number(subjectIdFilter) : undefined,
        unit_id: unitIdFilter ? Number(unitIdFilter) : undefined,
        topic_id: topicIdFilter ? Number(topicIdFilter) : undefined,
        category_id: categoryIdFilter ? Number(categoryIdFilter) : undefined
    };

    // Hook ile soruları yükle
    const { questions, loading, error, pagination, deleteQuestion } = useQuestions(page, filters);

    // Kategori değiştiğinde ilgili bilgileri otomatik doldur
    useEffect(() => {
        if (categoryIdFilter) {
            const selectedCategory = categories.find(c => c.id === categoryIdFilter);
            if (selectedCategory) {
                setGradeIdFilter(selectedCategory.grade_id);
                setSubjectIdFilter(selectedCategory.subject_id);
                setUnitIdFilter(selectedCategory.unit_id ?? '');
                setTopicIdFilter(selectedCategory.topic_id ?? '');
            }
        } else {
            setGradeIdFilter('');
            setSubjectIdFilter('');
            setUnitIdFilter('');
            setTopicIdFilter('');
        }
    }, [categoryIdFilter, categories]);

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

    // Tüm filtreleri sıfırla
    const handleResetFilters = () => {
        setSearch('');
        setTypeFilter('');
        setDifficultyFilter('');
        setGradeIdFilter('');
        setSubjectIdFilter('');
        setUnitIdFilter('');
        setTopicIdFilter('');
        setUserFilter('');
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
        return search ||
            typeFilter ||
            difficultyFilter ||
            categoryIdFilter ||
            userFilter;
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, my: 3 }}>
                {/* Başlık ve Butonlar */}
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
                        <Grid item xs={12} sm={6} sx={{
                            textAlign: { xs: 'left', sm: 'right' },
                            display: 'flex',
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                            gap: 2,
                            flexWrap: { xs: 'wrap', md: 'nowrap' }
                        }}>
                            {/* Excel ile Soru Ekleme Butonu */}
                            <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<FileUploadIcon />}
                                component={Link}
                                to="/questions/excel-import"
                                sx={{ fontSize: '0.9rem', py: 1.2 }}
                            >
                                Excel ile Ekle
                            </Button>

                            {/* Toplu Soru Ekleme Butonu */}
                            <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<ViewListIcon />}
                                component={Link}
                                to="/questions/bulk-add"
                                sx={{ fontSize: '0.9rem', py: 1.2 }}
                            >
                                Toplu Soru Ekle
                            </Button>

                            {/* Tek Soru Ekleme Butonu */}
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

                        {/* Kategori */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Kategori</InputLabel>
                                <Select
                                    value={categoryIdFilter}
                                    label="Kategori"
                                    onChange={(e) => setCategoryIdFilter(Number(e.target.value))}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    {categories.map(cat => (
                                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Sınıf */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth disabled>
                                <InputLabel>Sınıf</InputLabel>
                                <Select value={gradeIdFilter} label="Sınıf">
                                    {grades.map(grade => (
                                        <MenuItem key={grade.id} value={grade.id}>{grade.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Ders */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth disabled>
                                <InputLabel>Ders</InputLabel>
                                <Select value={subjectIdFilter} label="Ders">
                                    {subjects.map(subject => (
                                        <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Ünite */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth disabled>
                                <InputLabel>Ünite</InputLabel>
                                <Select value={unitIdFilter} label="Ünite">
                                    {units.map(unit => (
                                        <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Konu */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth disabled>
                                <InputLabel>Konu</InputLabel>
                                <Select value={topicIdFilter} label="Konu">
                                    {topics.map(topic => (
                                        <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>
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
                                                        `${question.category.grade?.name || '-'} / ${question.category.subject?.name || '-'} / ${question.category.unit?.name || '-'}` :
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