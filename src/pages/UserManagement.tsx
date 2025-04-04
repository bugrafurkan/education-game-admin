// src/pages/users/UserManagement.tsx
import {
    Box, Typography, Paper, CircularProgress, Alert, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useUsers } from '../hooks/useUsers.ts';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const { users, loading, error, removeUser } = useUsers();
    const navigate = useNavigate();

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Kullanıcı Yönetimi</Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/register')}
                    sx={{ backgroundColor: '#1a1a27', '&:hover': { backgroundColor: '#2a2a37' } }}
                >
                    Kullanıcı Ekle
                </Button>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <List>
                        {users.map((user) => (
                            <ListItem key={user.id} divider>
                                <ListItemText
                                    primary={user.name}
                                    secondary={user.email + ' - ' + user.role}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => removeUser(user.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default UserManagement;
