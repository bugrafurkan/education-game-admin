// src/pages/questions/QuestionList.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    TablePagination, Chip, IconButton, Grid, MenuItem, Select, FormControl,
    InputLabel, SelectChangeEvent
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Geçici soru tipi
interface Question {
    id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'qa';
    difficulty: 'easy' | 'medium' | 'hard';
    category_name: string;
    game_names: string[];
}

// Mock veri
const mockQuestions: Question[] = [
    {
        id: 1,
        question_text: 'İstanbul hangi yılda fethedilmiştir?',
        question_type: 'multiple_choice',
        difficulty: 'medium',
        category_name: 'Tarih - 8. Sınıf',
        game_names: ['Tarih Bilgi Yarışması', 'Osmanlı İmparatorluğu']
    },
    {
        id: 2,
        question_text: 'Su molekülü kaç atomdan oluşur?',
        question_type: 'multiple_choice',
        difficulty: 'easy',
        category_name: 'Fen Bilgisi - 6. Sınıf',
        game_names: ['Fen Soruları', 'Elementler']
    },
    {
        id: 3,
        question_text: 'Yer çekimi bir kuvvet midir?',
        question_type: 'true_false',
        difficulty: 'easy',
        category_name: 'Fen Bilgisi - 5. Sınıf',
        game_names: ['Fizik Bilgisi']
    },
    {
        id: 4,
        question_text: 'Türkiye\'nin başkenti neresidir?',
        question_type: 'qa',
        difficulty: 'easy',
        category_name: 'Sosyal Bilgiler - 4. Sınıf',
        game_names: ['Türkiye Bilgisi', 'Genel Kültür']
    },
    {
        id: 5,
        question_text: 'Pisagor teoremi nedir? Açıklayınız.',
        question_type: 'qa',
        difficulty: 'hard',
        category_name: 'Matematik - 8. Sınıf',
        game_names: ['Matematik Yarışması']
    },
];

const QuestionList = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('');

    useEffect(() => {
        // Backend API bağlantısı yerine mock veri kullanıyoruz
        setLoading(true);

        setTimeout(() => {
            setQuestions(mockQuestions);
            setLoading(false);
        }, 500);
    }, []);

    // Filtreleme işlemi
    const filteredQuestions = questions.filter(question => {
        return (
            question.question_text.toLowerCase().includes(search.toLowerCase()) &&
            (typeFilter === '' || question.question_type === typeFilter) &&
            (difficultyFilter === '' || question.difficulty === difficultyFilter)
        );
    });

    // Sayfalama işlemleri
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filtre değişiklikleri
    const handleTypeChange = (event: SelectChangeEvent) => {
        setTypeFilter(event.target.value);
    };

    const handleDifficultyChange = (event: SelectChangeEvent) => {
        setDifficultyFilter(event.target.value);
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
                return { label: 'Kolay', color: 'success' };
            case 'medium':
                return { label: 'Orta', color: 'warning' };
            case 'hard':
                return { label: 'Zor', color: 'error' };
            default:
                return { label: difficulty, color: 'default' };
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
                            onChange={(e) => setSearch(e.target.value)}
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
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : filteredQuestions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        Soru bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredQuestions
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((question) => (
                                        <TableRow key={question.id} hover>
                                            <TableCell>{question.id}</TableCell>
                                            <TableCell>{question.question_text}</TableCell>
                                            <TableCell>{getQuestionTypeLabel(question.question_type)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getDifficultyLabel(question.difficulty).label}
                                                    color={getDifficultyLabel(question.difficulty).color as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{question.category_name}</TableCell>
                                            <TableCell>
                                                <IconButton color="primary" title="Görüntüle">
                                                    <ViewIcon />
                                                </IconButton>
                                                <IconButton color="info" title="Düzenle">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" title="Sil">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredQuestions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                />
            </Paper>
        </Box>
    );
};

export default QuestionList;