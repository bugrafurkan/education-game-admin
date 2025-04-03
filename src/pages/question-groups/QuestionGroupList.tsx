// src/pages/question-groups/QuestionGroupList.tsx
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    TablePagination,  IconButton, Grid, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, CircularProgress, Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import * as questionGroupService from '../../services/question-group.service';

const QuestionGroupList = () => {
    useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questionGroups, setQuestionGroups] = useState<questionGroupService.QuestionGroup[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState('');
    const [filteredGroups, setFilteredGroups] = useState<questionGroupService.QuestionGroup[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
    const [codeDialogOpen, setCodeDialogOpen] = useState(false);
    const [selectedGroupCode, setSelectedGroupCode] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);

    useEffect(() => {
        fetchQuestionGroups();
    }, [page]);

    const fetchQuestionGroups = async () => {
        try {
            setLoading(true);
            const response = await questionGroupService.getQuestionGroups(page);
            setQuestionGroups(response.data);
            setTotalItems(response.total);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching question groups:', err);
            setError('Soru grupları yüklenirken bir hata oluştu.');
            setLoading(false);
        }
    };

    // Arama fonksiyonu
    useEffect(() => {
        if (search.trim() === '') {
            setFilteredGroups(questionGroups);
        } else {
            const filtered = questionGroups.filter(group =>
                group.name.toLowerCase().includes(search.toLowerCase()) ||
                group.code.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredGroups(filtered);
        }
    }, [search, questionGroups]);

    // Sayfalama işlemleri
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage + 1); // Material-UI sayfalama 0-tabanlı, API'miz 1-tabanlı
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    // Silme işlemleri
    const handleDeleteClick = (groupId: number) => {
        setGroupToDelete(groupId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (groupToDelete === null) return;

        try {
            await questionGroupService.deleteQuestionGroup(groupToDelete);
            setDeleteDialogOpen(false);
            setGroupToDelete(null);
            fetchQuestionGroups();
        } catch (err) {
            console.error('Error deleting question group:', err);
            setError('Soru grubu silinirken bir hata oluştu.');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setGroupToDelete(null);
    };

    // Kod kopyalama
    const handleCodeClick = (code: string) => {
        setSelectedGroupCode(code);
        setCodeDialogOpen(true);
        setCodeCopied(false);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(selectedGroupCode);
        setCodeCopied(true);
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

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Soru Grupları
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Grup Ara"
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

                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/question-groups/add"
                            sx={{
                                py: 1.5,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                        >
                            Yeni Soru Grubu Ekle
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
                                <TableCell width="25%">Grup Adı</TableCell>
                                <TableCell width="15%">Kod</TableCell>
                                <TableCell width="15%">Soru Tipi</TableCell>
                                <TableCell width="15%">Oyun</TableCell>
                                <TableCell width="10%">Soru Sayısı</TableCell>
                                <TableCell width="15%">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredGroups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        Soru grubu bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredGroups.map((group) => (
                                    <TableRow key={group.id} hover>
                                        <TableCell>{group.id}</TableCell>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {group.code}
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    sx={{ ml: 1 }}
                                                    onClick={() => handleCodeClick(group.code)}
                                                >
                                                    <CopyIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{getQuestionTypeLabel(group.question_type)}</TableCell>
                                        <TableCell>{group.game?.name || '-'}</TableCell>
                                        <TableCell>{group.questions_count}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                title="Görüntüle"
                                                component={Link}
                                                to={`/question-groups/${group.id}`}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                            <IconButton
                                                color="info"
                                                title="Düzenle"
                                                component={Link}
                                                to={`/question-groups/${group.id}/edit`}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                title="Sil"
                                                onClick={() => handleDeleteClick(group.id)}
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

                {!loading && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalItems}
                        rowsPerPage={rowsPerPage}
                        page={page - 1} // API'den 1-tabanlı, MUI'de 0-tabanlı
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
                <DialogTitle>Soru Grubunu Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu soru grubunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Kod Gösterme Dialogu */}
            <Dialog
                open={codeDialogOpen}
                onClose={() => setCodeDialogOpen(false)}
            >
                <DialogTitle>Grup Kodu</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu gruptan soruları çekmek için aşağıdaki kodu kullanabilirsiniz:
                    </DialogContentText>
                    <Box sx={{
                        my: 2,
                        p: 2,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '16px'
                    }}>
                        {selectedGroupCode}
                    </Box>
                    {codeCopied && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Kod panoya kopyalandı!
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCodeDialogOpen(false)}>
                        Kapat
                    </Button>
                    <Button
                        onClick={handleCopyCode}
                        variant="contained"
                        startIcon={<CopyIcon />}
                    >
                        Kopyala
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionGroupList;