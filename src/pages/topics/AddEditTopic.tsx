import {
    Box,
    Button,
    MenuItem,
    Paper,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    Grid
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getTopics,
    createTopic,
    updateTopic,
    getUnits,
    getGrades,
    getSubjects,
} from '../../services/education.service';
import { Topic, Unit, Grade, Subject } from '../../types/education';

const AddEditTopic = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        unit_id: '',
    });

    // Tüm veriler
    const [units, setUnits] = useState<Unit[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // Hiyerarşik seçimler
    const [gradeId, setGradeId] = useState<number | ''>('');
    const [subjectId, setSubjectId] = useState<number | ''>('');

    // Filtrelenmiş ünite listesi
    const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);

    useEffect(() => {
        // Tüm verileri yükle
        getUnits().then((res) => setUnits(res.data));
        getGrades().then((res) => setGrades(res.data));
        getSubjects().then((res) => setSubjects(res.data));

        if (isEdit) {
            getTopics().then((res) => {
                const topic = res.data.find((t: Topic) => t.id === Number(id));
                if (topic) {
                    setForm({
                        name: topic.name,
                        unit_id: topic.unit_id.toString(),
                    });

                    // Düzenleme modunda mevcut topic'in unit bilgilerini yükle
                    getUnits().then((unitRes) => {
                        const unit = unitRes.data.find((u) => u.id === topic.unit_id);
                        if (unit) {
                            setGradeId(unit.grade_id);
                            setSubjectId(unit.subject_id);
                        }
                    });
                }
            });
        }
    }, [id, isEdit]);

    // Grade ve Subject değiştiğinde ilgili üniteleri filtrele
    useEffect(() => {
        if (gradeId && subjectId) {
            const filtered = units.filter(
                unit => unit.grade_id === gradeId && unit.subject_id === subjectId
            );
            setFilteredUnits(filtered);

            // Eğer seçili ünite bu filtrelere uygun değilse, seçimi sıfırla
            if (form.unit_id && !filtered.some(unit => unit.id === Number(form.unit_id))) {
                setForm(prev => ({ ...prev, unit_id: '' }));
            }
        } else {
            setFilteredUnits([]);
            setForm(prev => ({ ...prev, unit_id: '' }));
        }
    }, [gradeId, subjectId, units, form.unit_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGradeChange = (event: SelectChangeEvent<number | ''>) => {
        setGradeId(event.target.value as number | '');
    };

    const handleSubjectChange = (event: SelectChangeEvent<number | ''>) => {
        setSubjectId(event.target.value as number | '');
    };

    const handleUnitChange = (event: SelectChangeEvent) => {
        setForm(prev => ({ ...prev, unit_id: event.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name,
                unit_id: Number(form.unit_id),
            };

            if (isEdit) {
                await updateTopic(Number(id), payload);
            } else {
                await createTopic(payload);
            }

            navigate('/topics');
        } catch (err) {
            console.error('İşlem hatası:', err);
        }
    };

    return (
        <Box sx={{
            width: '100%',
            px: 3,
            boxSizing: 'border-box'
        }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                {isEdit ? 'Konu Düzenle' : 'Yeni Konu Ekle'}
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 800 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Konu Adı */}
                        <Grid item xs={12}>
                            <TextField
                                label="Konu Adı"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>

                        {/* Hiyerarşik Seçim Alanları */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Kategori Seçimi
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'end' }}>
                                <FormControl fullWidth required sx={{ mb: 2, maxWidth: 200 }}>
                                    <InputLabel>Sınıf</InputLabel>
                                    <Select
                                        value={gradeId}
                                        label="Sınıf"
                                        onChange={handleGradeChange}
                                        required
                                    >
                                        <MenuItem value="" disabled>Sınıf Seçin</MenuItem>
                                        {grades.map((grade) => (
                                            <MenuItem key={grade.id} value={grade.id}>
                                                {grade.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required sx={{ mb: 2, maxWidth: 200 }}>
                                    <InputLabel>Ders</InputLabel>
                                    <Select
                                        value={subjectId}
                                        label="Ders"
                                        onChange={handleSubjectChange}
                                        required
                                    >
                                        <MenuItem value="" disabled>Ders Seçin</MenuItem>
                                        {subjects.map((subject) => (
                                            <MenuItem key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required sx={{ mb: 2, maxWidth: 200 }}>
                                    <InputLabel>Ünite</InputLabel>
                                    <Select
                                        value={form.unit_id}
                                        label="Ünite"
                                        onChange={handleUnitChange}
                                        disabled={!gradeId || !subjectId || filteredUnits.length === 0}
                                        required
                                    >
                                        <MenuItem value="" disabled>Ünite Seçin</MenuItem>
                                        {filteredUnits.map((unit) => (
                                            <MenuItem key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!form.name || !form.unit_id}
                        >
                            Kaydet
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{ ml: 2 }}
                            onClick={() => navigate('/topics')}
                        >
                            Vazgeç
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default AddEditTopic;