// src/components/layout/Layout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';

const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Header onMenuToggle={handleDrawerToggle} />

            <Sidebar
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - 240px)` },
                    ml: { md: '240px' },
                    mt: '64px',
                    backgroundColor: '#f5f8fa',
                    minHeight: '100vh'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;