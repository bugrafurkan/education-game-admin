// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import {
    Box, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Divider, Typography
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    QuestionAnswer as QuestionIcon,
    Games as GameIcon,
    Settings as SettingsIcon,
    Campaign as CampaignIcon

} from '@mui/icons-material';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    variant: "permanent" | "persistent" | "temporary";
}

const Sidebar = ({ open, onClose, variant }: SidebarProps) => {
    const location = useLocation();
    const drawerWidth = 240;

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Sorular', icon: <QuestionIcon />, path: '/questions' },
        { text: 'Oyunlar', icon: <GameIcon />, path: '/games' },
        { text: 'Reklamlar', icon: <CampaignIcon />, path: '/advertisements' }, // Yeni reklam menüsü
        { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings' },
    ];

    return (
        <Drawer
            variant={variant}
            open={open}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#1e1e2d',
                    color: '#9899ac'
                },
            }}
        >
            <Box sx={{ p: 2, backgroundColor: '#1a1a27' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Eğitim Oyun Platformu
                </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                    },
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;