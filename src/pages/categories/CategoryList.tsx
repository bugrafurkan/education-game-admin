// src/pages/categories/CategoryList.tsx
import { useState } from 'react';
import {
    Box, Typography, Paper, Button, TextField, InputAdornment,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    Chip, IconButton, Grid, MenuItem, Select, FormControl,
    InputLabel, SelectChangeEvent, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, CircularProgress, Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
    MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';

const CategoryList = () => {
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState<string>('');
    const [subjectFilter, setSubjectFilter] = useState<string>('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    // Hook ile kategorileri yükle
    const { categories, loading, error, deleteCategory } = useCategories();

    // Filtrelenmiş kategorileri bul
    const filteredCategories = categories.filter(category => {
        const searchMatch = search.trim() === '' ||
            category.name.toLowerCase().includes(search.toLowerCase()) ||
            category.grade.toLowerCase().includes(search.toLowerCase()) ||
            category.subject.toLowerCase().includes(search.toLowerCase());

        const gradeMatch = gradeFilter === '' || category.grade === gradeFilter;
        const subjectMatch = subjectFilter === '' || category.subject === subjectFilter;

        return searchMatch && gradeMatch && subjectMatch;
    });

    // Filtre değişikliklerini yönet
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleGradeChange = (event: SelectChangeEvent) => {
        setGradeFilter(event.target.value);
    };

    const handleSubjectChange = (event: SelectChangeEvent) => {
        setSubjectFilter(event.target.value);
    };

    // Silme işlemleri
    const handleDeleteClick = (categoryId: number) => {
        setCategoryToDelete(categoryId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (categoryToDelete === null) return;

        const success = await deleteCategory(categoryToDelete);
        if (success) {
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
    };

    // Benzersiz sınıf ve ders listelerini çıkar
    const uniqueGrades = Array.from(new Set(categories.map(cat => cat.grade)));
    const uniqueSubjects = Array.from(new Set(categories.map(cat => cat.subject)));

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Kategori Yönetimi
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center" >
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Kategori Ara"
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
                            <InputLabel>Sınıf</InputLabel>
                            <Select
                                value={gradeFilter}
                                label="Sınıf"
                                onChange={handleGradeChange}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                {uniqueGrades.map((grade) => (
                                    <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Ders</InputLabel>
                            <Select
                                value={subjectFilter}
                                label="Ders"
                                onChange={handleSubjectChange}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                {uniqueSubjects.map((subject) => (
                                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/categories/add"
                            sx={{
                                py: 1.5,
                                px: 3,
                                bgcolor: '#1a1a27',
                                '&:hover': { bgcolor: '#2a2a37' }
                            }}
                        >
                            Yeni Kategori Ekle
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{  overflowX: 'auto',borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f8fa' }}>
                            <TableRow>
                                <TableCell width="5%">#</TableCell>
                                <TableCell width="25%">Kategori Adı</TableCell>
                                <TableCell width="15%">Sınıf</TableCell>
                                <TableCell width="15%">Ders</TableCell>
                                <TableCell width="25%">Ünite / Açıklama</TableCell>
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
                            ) : filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        Kategori bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map((category) => (
                                    <TableRow key={category.id} hover>
                                        <TableCell>{category.id}</TableCell>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<SchoolIcon />}
                                                label={category.grade}
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<MenuBookIcon />}
                                                label={category.subject}
                                                variant="outlined"
                                                size="small"
                                                color="secondary"
                                            />
                                        </TableCell>
                                        <TableCell>{category.unit || category.description || '-'}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="info"
                                                title="Düzenle"
                                                component={Link}
                                                to={`/categories/${category.id}/edit`}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                title="Sil"
                                                onClick={() => handleDeleteClick(category.id)}
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
            </Paper>

            {/* Silme Onay Dialogu */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Kategoriyi Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve kategoriye ait tüm sorular etkilenebilir.
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

export default CategoryList;