// src/pages/question-groups/QuestionGroupList.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow, Grid,
    CircularProgress, Alert, Select, MenuItem, IconButton
} from '@mui/material';
import {
    Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon,
    Visibility as ViewIcon, ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import * as questionGroupService from '../../services/question-group.service';
import { useGames } from '../../hooks/useGames';

const QuestionGroupList = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groups, setGroups] = useState<questionGroupService.QuestionGroup[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [search, setSearch] = useState('');
    const [questionType, setQuestionType] = useState('');
    const [gameId, setGameId] = useState('');
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const { games } = useGames();

    useEffect(() => {
        fetchGroups();
    }, [page, rowsPerPage, search, questionType, gameId, sortField, sortDirection]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await questionGroupService.getQuestionGroups(page);
            setGroups(response.data);
            setTotalItems(response.total);
        } catch (e) {
            setError('Veriler alınamadı');
        }
        setLoading(false);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Soru Grupları</Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Grup Ara"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Select fullWidth value={questionType} onChange={(e) => setQuestionType(e.target.value)} displayEmpty>
                            <MenuItem value="">Tüm Soru Tipleri</MenuItem>
                            <MenuItem value="multiple_choice">Çoktan Seçmeli</MenuItem>
                            <MenuItem value="true_false">Doğru-Yanlış</MenuItem>
                            <MenuItem value="qa">Klasik</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Select fullWidth value={gameId} onChange={(e) => setGameId(e.target.value)} displayEmpty>
                            <MenuItem value="">Tüm Oyunlar</MenuItem>
                            {games.map((game) => (
                                <MenuItem key={game.id} value={game.id}>{game.name}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Button
                            component={Link}
                            to="/question-groups/add"
                            variant="contained"
                            startIcon={<AddIcon />}
                            fullWidth
                        >
                            Yeni Ekle
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer' }}>Grup Adı {getSortIcon('name')}</TableCell>
                                <TableCell onClick={() => handleSort('question_type')} sx={{ cursor: 'pointer' }}>Soru Tipi {getSortIcon('question_type')}</TableCell>
                                <TableCell onClick={() => handleSort('game_id')} sx={{ cursor: 'pointer' }}>Oyun {getSortIcon('game_id')}</TableCell>
                                <TableCell>Soru Sayısı</TableCell>
                                <TableCell>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                            ) : groups.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center">Kayıt bulunamadı</TableCell></TableRow>
                            ) : (
                                groups.map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>{group.question_type}</TableCell>
                                        <TableCell>{group.game?.name || '-'}</TableCell>
                                        <TableCell>{group.questions_count}</TableCell>
                                        <TableCell>
                                            <IconButton component={Link} to={`/question-groups/${group.id}`}><ViewIcon /></IconButton>
                                            <IconButton component={Link} to={`/question-groups/${group.id}/edit`}><EditIcon /></IconButton>
                                            <IconButton color="error"><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={totalItems}
                    page={page - 1}
                    onPageChange={(_, newPage) => setPage(newPage + 1)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(1);
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Paper>
        </Box>
    );
};

export default QuestionGroupList;