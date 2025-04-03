// src/pages/categories/AddEditCategory.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, TextField, Grid,
    CircularProgress, Alert, IconButton, FormControl,
    InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import * as categoryService from '../../services/category.service';

// Eğitimdeki yaygın sınıf seviyeleri için ön tanımlı değerler
const commonGrades = [
    "Anaokulu", "1-4", "5-8", "9-12", "Üniversite", "Tümü"
];

// Eğitimdeki yaygın dersler için ön tanımlı değerler
const commonSubjects = [
    "Matematik", "Fen Bilgisi", "Türkçe", "Sosyal Bilgiler", "İngilizce",
    "Fizik", "Kimya", "Biyoloji", "Coğrafya", "Tarih", "Diğer"
];

const AddEditCategory = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    // Form state
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');

    // Custom values (eğer listede olmayan bir değer girilecekse)
    const [customGrade, setCustomGrade] = useState('');
    const [customSubject, setCustomSubject] = useState('');

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Kategoriyi yükle (düzenleme modu için)
    useEffect(() => {
        if (isEdit) {
            const fetchCategory = async () => {
                try {
                    setLoading(true);
                    const categoryData = await categoryService.getCategory(parseInt(id!));

                    // Form alanlarını doldur
                    setName(categoryData.name);
                    setGrade(categoryData.grade);
                    setSubject(categoryData.subject);
                    setUnit(categoryData.unit || '');
                    setDescription(categoryData.description || '');

                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching category:', err);
                    setError('Kategori yüklenirken bir hata oluştu.');
                    setLoading(false);
                }
            };

            fetchCategory();
        }
    }, [id, isEdit]);

    // Form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            // Eğer özel değerler girilmişse bunları kullan
            const finalGrade = grade === 'custom' ? customGrade : grade;
            const finalSubject = subject === 'custom' ? customSubject : subject;

            const categoryData: categoryService.CategoryCreate = {
                name,
                grade: finalGrade,
                subject: finalSubject,
                unit: unit || undefined,
                description: description || undefined
            };

            if (isEdit) {
                await categoryService.updateCategory(parseInt(id!), categoryData);
                setSuccess('Kategori başarıyla güncellendi.');
            } else {
                await categoryService.createCategory(categoryData);
                setSuccess('Kategori başarıyla oluşturuldu.');

                // Yeni kategori eklendiyse formu sıfırla
                if (!isEdit) {
                    setName('');
                    setGrade('');
                    setSubject('');
                    setUnit('');
                    setDescription('');
                    setCustomGrade('');
                    setCustomSubject('');
                }
            }

            // 2 saniye sonra kategoriler sayfasına yönlendir
            setTimeout(() => {
                navigate('/categories');
            }, 2000);

        } catch (err) {
            console.error('Error saving category:', err);
            setError(isEdit ? 'Kategori güncellenirken bir hata oluştu.' : 'Kategori oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Sınıf ve ders seçimi
    const handleGradeChange = (event: SelectChangeEvent) => {
        setGrade(event.target.value);
    };

    const handleSubjectChange = (event: SelectChangeEvent) => {
        setSubject(event.target.value);
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton
                    component={Link}
                    to="/categories"
                    color="primary"
                    sx={{ mr: 1 }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">
                    {isEdit ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                </Typography>
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                {loading && !isEdit ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Kategori Adı"
                                    fullWidth
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Sınıf Seviyesi</InputLabel>
                                    <Select
                                        value={grade}
                                        label="Sınıf Seviyesi"
                                        onChange={handleGradeChange}
                                        required
                                        disabled={loading}
                                    >
                                        {commonGrades.map((g) => (
                                            <MenuItem key={g} value={g}>{g}</MenuItem>
                                        ))}
                                        <MenuItem value="custom">Diğer (Özel)</MenuItem>
                                    </Select>
                                </FormControl>

                                {grade === 'custom' && (
                                    <TextField
                                        label="Özel Sınıf Seviyesi"
                                        fullWidth
                                        value={customGrade}
                                        onChange={(e) => setCustomGrade(e.target.value)}
                                        required
                                        disabled={loading}
                                        margin="normal"
                                    />
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Ders</InputLabel>
                                    <Select
                                        value={subject}
                                        label="Ders"
                                        onChange={handleSubjectChange}
                                        required
                                        disabled={loading}
                                    >
                                        {commonSubjects.map((s) => (
                                            <MenuItem key={s} value={s}>{s}</MenuItem>
                                        ))}
                                        <MenuItem value="custom">Diğer (Özel)</MenuItem>
                                    </Select>
                                </FormControl>

                                {subject === 'custom' && (
                                    <TextField
                                        label="Özel Ders"
                                        fullWidth
                                        value={customSubject}
                                        onChange={(e) => setCustomSubject(e.target.value)}
                                        required
                                        disabled={loading}
                                        margin="normal"
                                    />
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Ünite"
                                    fullWidth
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    disabled={loading}
                                    placeholder="Örneğin: Bölüm 3 - Doğal Sayılar"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Açıklama"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2, textAlign: 'right' }}>
                                <Button
                                    component={Link}
                                    to="/categories"
                                    variant="outlined"
                                    sx={{ mr: 2 }}
                                    disabled={loading}
                                >
                                    İptal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !name || (!grade && !customGrade) || (!subject && !customSubject)}
                                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                    sx={{
                                        py: 1.5,
                                        px: 3,
                                        bgcolor: '#1a1a27',
                                        '&:hover': { bgcolor: '#2a2a37' }
                                    }}
                                >
                                    {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Kaydet')}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Paper>
        </Box>
    );
};

export default AddEditCategory;