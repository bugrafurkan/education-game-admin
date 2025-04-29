import {
    Box,
    Button,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    createUnit,
    getUnits,
    getGrades,
    getSubjects,
    updateUnit,
} from '../../services/education.service';
import { Grade, Subject, Unit } from '../../types/education';

const AddEditUnit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        grade_id: '',
        subject_id: '',
    });

    const [grades, setGrades] = useState<Grade[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        getGrades().then((res) => setGrades(res.data));
        getSubjects().then((res) => setSubjects(res.data));

        if (isEdit) {
            getUnits().then((res) => {
                const unit = res.data.find((u: Unit) => u.id === Number(id));
                if (unit) {
                    setForm({
                        name: unit.name,
                        grade_id: unit.grade_id.toString(),
                        subject_id: unit.subject_id.toString(),
                    });
                }
            });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name,
                grade_id: Number(form.grade_id),
                subject_id: Number(form.subject_id),
            };

            if (isEdit) {
                await updateUnit(Number(id), payload);
            } else {
                await createUnit(payload);
            }

            navigate('/units');
        } catch (err) {
            console.error('İşlem sırasında hata:', err);
        }
    };

    return (
        <Box sx={{
            width: '100%',
            px: 3,            // Responsive boşluk (varsayılan container gibi)
            boxSizing: 'border-box'
        }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                {isEdit ? 'Ünite Düzenle' : 'Yeni Ünite Ekle'}
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 500 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Ünite Adı"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    />

                    <TextField
                        select
                        label="Sınıf"
                        name="grade_id"
                        value={form.grade_id}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    >
                        {grades.map((g) => (
                            <MenuItem key={g.id} value={g.id}>
                                {g.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Ders"
                        name="subject_id"
                        value={form.subject_id}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    >
                        {subjects.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box mt={2}>
                        <Button type="submit" variant="contained">
                            Kaydet
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{ ml: 2 }}
                            onClick={() => navigate('/units')}
                        >
                            Vazgeç
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default AddEditUnit;
