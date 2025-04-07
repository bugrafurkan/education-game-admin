import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {getTopics, deleteTopic, getUnits, getSubjects, getGrades} from '../../services/education.service';
import {Grade, Subject, Topic, Unit} from '../../types/education';

const TopicList = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [topicRes, unitRes, gradeRes, subjectRes] = await Promise.all([
                getTopics(),
                getUnits(),
                getGrades(),
                getSubjects(),
            ]);

            setTopics(topicRes.data);
            setUnits(unitRes.data);
            setGrades(gradeRes.data);
            setSubjects(subjectRes.data);
        } catch (err) {
            console.error('Veri çekme hatası:', err);
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = window.confirm('Bu konuyu silmek istediğinizden emin misiniz?');
        if (confirm) {
            await deleteTopic(id);
            fetchData();
        }
    };

    //const getUnitName = (id: number) => units.find((u) => u.id === id)?.name || '-';

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h5" fontWeight="bold">Konular</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/topics/add')}
                >
                    Yeni Konu Ekle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Konu Adı</TableCell>
                            <TableCell>Ünite</TableCell>
                            <TableCell>Sınıf</TableCell>
                            <TableCell>Ders</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topics.map((topic) => {
                            const unit = units.find((u) => u.id === topic.unit_id);
                            const grade = grades.find((g) => g.id === unit?.grade_id);
                            const subject = subjects.find((s) => s.id === unit?.subject_id);

                            return (
                                <TableRow key={topic.id}>
                                    <TableCell>{topic.name}</TableCell>
                                    <TableCell>{unit?.name || '-'}</TableCell>
                                    <TableCell>{grade?.name || '-'}</TableCell>
                                    <TableCell>{subject?.name || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/topics/edit/${topic.id}`)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(topic.id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {topics.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Hiç konu bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
            </TableContainer>
        </Box>
    );
};

export default TopicList;
