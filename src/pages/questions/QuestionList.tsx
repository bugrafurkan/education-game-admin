// src/pages/questions/QuestionList.tsx
import { useState } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    TablePagination, Chip, IconButton, Grid, MenuItem, Select, FormControl,
    InputLabel, SelectChangeEvent, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, CircularProgress, Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useQuestions } from '../../hooks/useQuestions';
import { deleteQuestion } from '../../services/question.service';

const QuestionList = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // API filtreleri
    const filters = {
        search: search || undefined,
        type: typeFilter || undefined,
        difficulty: difficultyFilter || undefined
    };

    // Hook ile soruları yükle
    const { questions, loading, error, pagination, refresh } = useQuestions(page, filters);

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
        setDeleteError(null);
    };

    const handleDeleteConfirm = async () => {
        if (questionToDelete === null) return;

        setIsDeleting(true);
        try {
            await deleteQuestion(questionToDelete);
            setDeleteDialogOpen(false);
            refresh(); // Listeyi yenile
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setDeleteError('Soru silinirken bir hata oluştu.');
        } finally {
            setIsDeleting(false);
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

                    <Grid item xs={12} md={2}>
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

                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
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
                                <TableCell width="40%">Soru</TableCell>
                                <TableCell width="15%">Soru Tipi</TableCell>
                                <TableCell width="10%">Zorluk</TableCell>
                                <TableCell width="15%">Kategori</TableCell>
                                <TableCell width="15%">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : questions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        Soru bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                questions.map((question) => (
                                    <TableRow key={question.id} hover>
                                        <TableCell>{question.id}</TableCell>
                                        <TableCell>{question.question_text}</TableCell>
                                        <TableCell>{getQuestionTypeLabel(question.question_type)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getDifficultyLabel(question.difficulty).label}
                                                color={getDifficultyLabel(question.difficulty).color}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{question.category?.name || '-'}</TableCell>
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

                {!loading && questions.length > 0 && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={pagination.total}
                        rowsPerPage={rowsPerPage}
                        page={pagination.currentPage - 1} // API'den 1-tabanlı, MUI'de 0-tabanlı
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

                    {deleteError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={isDeleting}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} /> : null}
                    >
                        {isDeleting ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionList;