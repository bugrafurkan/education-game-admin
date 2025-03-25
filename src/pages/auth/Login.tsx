// src/pages/auth/Login.tsx
import { useState } from 'react';
import {
    Box, Paper, Typography, TextField, Button,
    CircularProgress, Alert, Link
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(email, password);
        } catch (err) {
            // Hata hook içinde ele alınıyor
            console.error('Login failed');
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f8fa'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: '450px',
                    borderRadius: '8px'
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Eğitim Oyun Platformu
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Admin Paneline Giriş
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="E-posta"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Şifre"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                        sx={{ mb: 3 }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            backgroundColor: '#1a1a27',
                            '&:hover': {
                                backgroundColor: '#2a2a37',
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Giriş Yap'}
                    </Button>
                </form>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link href="#" underline="none" sx={{ color: 'primary.main' }}>
                        Şifrenizi mi unuttunuz?
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;