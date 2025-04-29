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

    const [units, setUnits] = useState<Unit[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    useEffect(() => {
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

                    getUnits().then((unitRes) => {
                        const unit = unitRes.data.find((u) => u.id === topic.unit_id);
                        if (unit) setSelectedUnit(unit);
                    });

                }
            });
        }
    }, [id]);

    useEffect(() => {
        const unit = units.find((u) => u.id === Number(form.unit_id));
        if (unit) {
            setSelectedUnit(unit);
        }
    }, [form.unit_id, units]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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

    const selectedGrade = grades.find((g) => g.id === selectedUnit?.grade_id);
    const selectedSubject = subjects.find((s) => s.id === selectedUnit?.subject_id);

    return (
        <Box sx={{
            width: '100%',
            px: 3,            // Responsive boşluk (varsayılan container gibi)
            boxSizing: 'border-box'
        }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                {isEdit ? 'Konu Düzenle' : 'Yeni Konu Ekle'}
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 500 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Konu Adı"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    />

                    <TextField
                        select
                        label="Ünite Seç"
                        name="unit_id"
                        value={form.unit_id}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    >
                        {units.map((unit) => (
                            <MenuItem key={unit.id} value={unit.id}>
                                {unit.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Sınıf"
                        value={selectedGrade?.name || ''}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <TextField
                        label="Ders"
                        value={selectedSubject?.name || ''}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <Box mt={2}>
                        <Button type="submit" variant="contained">
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
