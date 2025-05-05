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
    const drawerWidth = 240;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#f5f8fa'
        }}>
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
                    marginLeft: { xs: 0, md: `${drawerWidth}px` },
                    marginTop: '64px',
                    minHeight: 'calc(100vh - 64px)',
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    })
                }}
            >
                <Box sx={{ width: '100%', maxWidth: '1400px', p: 0 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;