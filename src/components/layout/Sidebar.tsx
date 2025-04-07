import { Link, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Collapse,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    QuestionAnswer as QuestionIcon,
    Games as GameIcon,
    Settings as SettingsIcon,
    Campaign as CampaignIcon,
    LibraryBooks as LibraryBooksIcon,
    Category as CategoryIcon,
    People as PeopleIcon,
    ExpandLess,
    ExpandMore,
    School as GradeIcon,
    MenuBook as SubjectIcon,
    ViewModule as UnitIcon,
    Description as TopicIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    variant: 'permanent' | 'persistent' | 'temporary';
}

const Sidebar = ({ open, onClose, variant }: SidebarProps) => {
    const location = useLocation();
    const drawerWidth = 240;
    const { isAuthenticated } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [openCategoryMenu, setOpenCategoryMenu] = useState(false);

    useEffect(() => {
        const role = sessionStorage.getItem('user_role');
        setUserRole(role);
    }, [isAuthenticated]);

    const allMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Sorular', icon: <QuestionIcon />, path: '/questions' },
        { text: 'Oyunlar', icon: <GameIcon />, path: '/games' },
        { text: 'Soru Grupları', icon: <LibraryBooksIcon />, path: '/question-groups' },
        { text: 'Reklamlar', icon: <CampaignIcon />, path: '/advertisements' },
        { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings' },
    ];

    const editorOnlyItems = [
        { text: 'Kullanıcı Yönetimi', icon: <PeopleIcon />, path: '/user-management' },
    ];

    const menuItemsToRender = userRole === 'editor' ? editorOnlyItems : allMenuItems;

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
                    color: '#9899ac',
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
                {menuItemsToRender.map((item) => (
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
                            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}

                {/* Kategoriler Menüsü Elle Eklenmiş */}
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => setOpenCategoryMenu(!openCategoryMenu)}
                        selected={location.pathname.startsWith('/categories')}
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
                            <CategoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Kategoriler" />
                        {openCategoryMenu ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </ListItem>

                <Collapse in={openCategoryMenu} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton
                            component={Link}
                            to="/categories"
                            selected={location.pathname === '/categories'}
                            sx={{ pl: 4 }}
                        >
                            <ListItemText primary="Kategori Listesi" />
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/grades"
                            selected={location.pathname === '/grades'}
                            sx={{ pl: 4 }}
                        >
                            <ListItemIcon sx={{ color: 'inherit' }}>
                                <GradeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Sınıflar" />
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/subjects"
                            selected={location.pathname === '/subjects'}
                            sx={{ pl: 4 }}
                        >
                            <ListItemIcon sx={{ color: 'inherit' }}>
                                <SubjectIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dersler" />
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/units"
                            selected={location.pathname === '/units'}
                            sx={{ pl: 4 }}
                        >
                            <ListItemIcon sx={{ color: 'inherit' }}>
                                <UnitIcon />
                            </ListItemIcon>
                            <ListItemText primary="Üniteler" />
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/topics"
                            selected={location.pathname === '/topics'}
                            sx={{ pl: 4 }}
                        >
                            <ListItemIcon sx={{ color: 'inherit' }}>
                                <TopicIcon />
                            </ListItemIcon>
                            <ListItemText primary="Konular" />
                        </ListItemButton>
                    </List>
                </Collapse>
            </List>
        </Drawer>
    );
};

export default Sidebar;
