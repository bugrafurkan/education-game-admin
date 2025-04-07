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
import { getUnits, deleteUnit, getGrades, getSubjects } from '../../services/education.service';
import { Unit, Grade, Subject } from '../../types/education';

const UnitList = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [unitRes, gradeRes, subjectRes] = await Promise.all([
                getUnits(),
                getGrades(),
                getSubjects(),
            ]);
            setUnits(unitRes.data);
            setGrades(gradeRes.data);
            setSubjects(subjectRes.data);
        } catch (err) {
            console.error('Veriler alınamadı:', err);
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = window.confirm('Bu ünite silinsin mi?');
        if (confirm) {
            await deleteUnit(id);
            fetchData();
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getGradeName = (id: number) => grades.find((g) => g.id === id)?.name || '-';
    const getSubjectName = (id: number) => subjects.find((s) => s.id === id)?.name || '-';

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h5" fontWeight="bold">Üniteler</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/units/add')}
                >
                    Yeni Ünite Ekle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Ünite Adı</TableCell>
                            <TableCell>Sınıf</TableCell>
                            <TableCell>Ders</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {units.map((unit, index) => (
                            <TableRow key={unit.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{unit.name}</TableCell>
                                <TableCell>{getGradeName(unit.grade_id)}</TableCell>
                                <TableCell>{getSubjectName(unit.subject_id)}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => navigate(`/units/edit/${unit.id}`)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(unit.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {units.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Ünite bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UnitList;
