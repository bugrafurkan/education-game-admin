// src/pages/auth/Login.tsx
import { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button,
    CircularProgress, Alert, Link, Modal, Grid,
    IconButton, FormControl, InputLabel, Select, MenuItem, Snackbar
} from '@mui/material';
import { LockOutlined, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useSignup } from '../../hooks/useSignup';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    // Signup states
    const [openSignup, setOpenSignup] = useState(false);
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupRole, setSignupRole] = useState('editor'); // Default role
    const { signup, loading: signupLoading, error: signupError, success } = useSignup();

    // Snackbar notification
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Success state'i değiştiğinde çalışacak useEffect
    useEffect(() => {
        if (success) {
            // Kayıt başarılı oldu, pop-up'ı kapat
            handleCloseSignup();

            // Kullanıcıya bilgi ver
            setSnackbarMessage('Kullanıcı başarıyla oluşturuldu!');
            setOpenSnackbar(true);

            // Login formunda e-posta'yı otomatik doldur
            setEmail(signupEmail);
            setPassword('');
        }
    }, [success, signupEmail]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(email, password);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                console.error('Login failed:', axiosError.response?.data?.message || 'Unknown error');
            } else {
                console.error('Login failed:', error);
            }
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (signupPassword !== signupConfirmPassword) {
            return; // Password validation is handled in the form
        }

        try {
            await signup({
                name: signupName,
                email: signupEmail,
                password: signupPassword,
                role: signupRole
            });
        } catch (error) {
            console.error('Signup failed:', error);
        }
    };

    const handleOpenSignup = () => setOpenSignup(true);
    const handleCloseSignup = () => setOpenSignup(false);
    const handleCloseSnackbar = () => setOpenSnackbar(false);

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

                <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
                    <Link href="#" underline="none" sx={{ color: 'primary.main' }}>
                        Şifrenizi mi unuttunuz?
                    </Link>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={handleOpenSignup}
                        underline="none"
                        sx={{ color: 'primary.main' }}
                    >
                        Yeni Kullanıcı Kaydı
                    </Link>
                </Box>
            </Paper>

            {/* Signup Modal */}
            <Modal
                open={openSignup}
                onClose={handleCloseSignup}
                aria-labelledby="signup-modal-title"
                aria-describedby="signup-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    maxWidth: 500,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography id="signup-modal-title" variant="h6" component="h2">
                            Yeni Kullanıcı Kaydı
                        </Typography>
                        <IconButton onClick={handleCloseSignup} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {signupError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {signupError}
                        </Alert>
                    )}

                    <form onSubmit={handleSignupSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Ad Soyad"
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="E-posta"
                                    type="email"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Şifre"
                                    type="password"
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Şifre Tekrar"
                                    type="password"
                                    value={signupConfirmPassword}
                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                    error={signupPassword !== signupConfirmPassword && signupConfirmPassword !== ''}
                                    helperText={signupPassword !== signupConfirmPassword && signupConfirmPassword !== '' ? 'Şifreler eşleşmiyor' : ''}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="role-select-label">Kullanıcı Rolü</InputLabel>
                                    <Select
                                        labelId="role-select-label"
                                        value={signupRole}
                                        label="Kullanıcı Rolü"
                                        onChange={(e) => setSignupRole(e.target.value)}
                                        required
                                    >
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="viewer">İzleyici</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={signupLoading}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        backgroundColor: '#1a1a27',
                                        '&:hover': {
                                            backgroundColor: '#2a2a37',
                                        }
                                    }}
                                >
                                    {signupLoading ? <CircularProgress size={24} /> : 'Kaydol'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Modal>

            {/* Başarılı Kayıt Bildirim Snackbar'ı */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};

export default Login;