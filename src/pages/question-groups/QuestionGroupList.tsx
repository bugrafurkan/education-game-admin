// src/pages/question-groups/QuestionGroupList.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow, Grid,
    CircularProgress, Alert, Select, MenuItem, IconButton, FormControl, InputLabel,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle // Dialog bileşenlerini ekledik
} from '@mui/material';
import {
    Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon,
    Visibility as ViewIcon, ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import * as questionGroupService from '../../services/question-group.service';
import { useGames } from '../../hooks/useGames';
import { useCategories } from '../../hooks/useCategories';

const QuestionGroupList = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groups, setGroups] = useState<questionGroupService.QuestionGroup[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [search, setSearch] = useState('');
    const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false' | 'qa' | ''>('');
    const [gameId, setGameId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Silme işlemi için dialog state'leri
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { games } = useGames();
    const { categories } = useCategories();

    // Soru tiplerini kullanıcı dostu formata dönüştüren yardımcı fonksiyon
    const getQuestionTypeLabel = (type: string): string => {
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

    useEffect(() => {
        fetchGroups();
    }, [page, rowsPerPage, search, questionType, gameId, categoryId, sortField, sortDirection]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await questionGroupService.getQuestionGroups(page, {
                search,
                question_type: questionType || undefined,
                game_id: gameId,
                category_id: categoryId,
                sort_field: sortField,
                sort_direction: sortDirection
            });
            setGroups(response.data);
            setTotalItems(response.total);
        } catch (e) {
            console.error(e);
            setError('Veriler alınamadı');
        }
        setLoading(false);
    };

    // Silme dialogunu açan fonksiyon
    const handleDeleteClick = (groupId: number, event: React.MouseEvent) => {
        event.stopPropagation(); // Event'in parent elementlere geçişini engelle
        setGroupToDelete(groupId);
        setDeleteDialogOpen(true);
    };

    // Silme işlemini gerçekleştiren fonksiyon
    const handleDeleteConfirm = async () => {
        if (!groupToDelete) return;

        setDeleteLoading(true);
        try {
            await questionGroupService.deleteQuestionGroup(groupToDelete);
            // Silme başarılı olduğunda listeyi güncelle
            fetchGroups();
            setError(null);
        } catch (e) {
            console.error('Silme hatası:', e);
            setError('Etkinlik silinirken bir hata oluştu');
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setGroupToDelete(null);
        }
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
        <Box sx={{
            width: '100%',
            px: 2,            // Responsive boşluk (varsayılan container gibi)
            boxSizing: 'border-box'
        }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Etkinlikler</Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Etkinlik Ara"
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
                        <FormControl fullWidth>
                            <InputLabel>Soru Tipi</InputLabel>
                            <Select
                                value={questionType}
                                onChange={(e) => setQuestionType(e.target.value as 'multiple_choice' | 'true_false' | 'qa' | '')}>
                                <MenuItem value="">Tüm Soru Tipleri</MenuItem>
                                <MenuItem value="multiple_choice">Çoktan Seçmeli</MenuItem>
                                <MenuItem value="true_false">Doğru-Yanlış</MenuItem>
                                <MenuItem value="qa">Klasik</MenuItem>
                            </Select>
                        </FormControl>

                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Oyun</InputLabel>
                            <Select value={gameId} onChange={(e) => setGameId(e.target.value)}>
                                <MenuItem value="">Tüm Oyunlar</MenuItem>
                                {games.map((game) => (
                                    <MenuItem key={game.id} value={game.id}>{game.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Kategori</InputLabel>
                            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                <MenuItem value="">Tüm Kategoriler</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={12} sx={{ textAlign: 'right' }}>
                        <Button
                            component={Link}
                            to="/question-groups/add"
                            variant="contained"
                            startIcon={<AddIcon />}
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
                                <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer' }}>Etkinlik Adı {getSortIcon('name')}</TableCell>
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
                                        <TableCell>{getQuestionTypeLabel(group.question_type)}</TableCell>
                                        <TableCell>{group.game?.name || '-'}</TableCell>
                                        <TableCell>{group.questions_count}</TableCell>
                                        <TableCell>
                                            <IconButton component={Link} to={`/question-groups/${group.id}`}><ViewIcon /></IconButton>
                                            <IconButton component={Link} to={`/question-groups/${group.id}/edit`}><EditIcon /></IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={(e) => handleDeleteClick(group.id, e)}
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

            {/* Silme Onay Dialogu */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Etkinliği Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? <CircularProgress size={24} /> : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionGroupList;