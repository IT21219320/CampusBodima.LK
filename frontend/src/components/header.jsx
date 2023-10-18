import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem, } from "@mui/material";
import {Offcanvas} from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { useLogoutMutation } from "../slices/usersApiSlice";
import { clearUserInfo } from "../slices/authSlice";
import { toast } from "react-toastify";
import { StringToAvatar } from "../utils/StringToAvatar";
import MenuIcon from "@mui/icons-material/Menu";
import AdbIcon from "@mui/icons-material/Adb";

import headerStyles from "../styles/headerStyles.module.css";

const pages = ["Products", "Pricing", "Blog"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

const Header = () => {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [isSticky, setIsSticky] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);

    const { userInfo } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logout] = useLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logout().unwrap();
            dispatch(clearUserInfo());
            toast.success("Logged Out");
            navigate("/");
        } catch (err) {
            toast.error(err);
        }
    };

    let timeout;
    const handleScroll = () => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            if (document.getElementById("main").scrollTop > 10) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        }, 10);
    };

    useEffect(() => {
        document.getElementById("main").addEventListener("scroll", handleScroll);
    }, []);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar id="header" className={`${headerStyles.header} ${isSticky ? headerStyles.sticky : ""}`} >
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{display: { xs: "none", md: "flex" }}}>
                        <img src="/logo3.png" width='100px' />
                    </Box>

                    <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={() => setShowDrawer(true)}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Offcanvas show={showDrawer} onHide={() => setShowDrawer(false)} style={{width:'200px'}}>
                            <Offcanvas.Body>
                            <Button
                                onClick={() => navigate('/')}
                                sx={{ my: 2, px: 3, mx: 2, color: "white", display: "block" }}
                            >
                                Home
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                sx={{ my: 2, px: 3, mx: 2, color: "white", display: "block" }}
                            >
                                About Us
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                sx={{ my: 2, px: 3, mx: 2, color: "white", display: "block" }}
                            >
                                Contact Us
                            </Button>
                            </Offcanvas.Body>
                        </Offcanvas>
                    </Box>
                    <Box sx={{display: { xs: "flex", md: "none" }}} style={{width:'100%', justifyContent:'center'}}>
                        <img src="/logoBig2.png" width='200px' />
                    </Box>
                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent:'center' }}>
                            <Button
                                onClick={() => navigate('/')}
                                sx={{ my: 2, px: 3, mx: 2, color: "white", display: "block" }}
                            >
                                Home
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                sx={{ my: 2, px: 3, mx: 2, color: "white", display: "block" }}
                            >
                                About Us
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                sx={{ my: 2, px: 3, mx: 2, color: "white", display: "block" }}
                            >
                                Contact Us
                            </Button>
                    </Box>
                    {userInfo ? 
                    <Box sx={{ flexGrow: 0 }}>
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            {userInfo.image ? 
                                <Avatar alt={userInfo.firstName+" "+userInfo.lastName} src={userInfo.image} sx={{ width: 40, height: 40, cursor:'pointer' }} /> 
                                : 
                                <Typography component="div">
                                    <Avatar alt={userInfo.firstName+" "+userInfo.lastName} {...StringToAvatar(userInfo.firstName+" "+userInfo.lastName)} style={{ width: 40, height:40, fontSize: 20, cursor:'pointer' }} />
                                </Typography> 
                            }
                        </IconButton>
                        <Menu
                            sx={{ mt: "45px" }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem onClick={() => navigate('/profile')}>
                                <Typography textAlign="center">Profile</Typography>
                            </MenuItem>
                            <MenuItem onClick={logoutHandler}>
                                <Typography textAlign="center">Logout</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                    :
                    
                    <Box sx={{ flexGrow: 0 }}>
                        <Button onClick={() => navigate('/login')} sx={{ p: 0, color:'white' }}>
                            <FaSignInAlt /> Sign In &nbsp; &nbsp;
                        </Button>
                        <Button onClick={() => navigate('/register')} sx={{ p: 0, color:'white' }}>
                            <FaSignOutAlt /> Sign Up
                        </Button>
                    </Box>}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
