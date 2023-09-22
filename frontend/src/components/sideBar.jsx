import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation  } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { Box, List, CssBaseline, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { HomeRounded, Person, HomeWorkRounded, MenuRounded, MenuOpenRounded, ContactSupportRounded, Kitchen,RateReviewRounded, MonetizationOn  } from '@mui/icons-material';
import { Button, Image } from 'react-bootstrap';
import {setSideBarStatus} from '../slices/customizeSlice';

import sideBarStyles from '../styles/sideBarStyles.module.css'
import LogoBig from '/logoBig2.png';
import Logo from '/logo.png';
import { RiWaterFlashFill } from 'react-icons/ri';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  background: '#242745',
  color:'white'
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(8)} + 1px)`,
  background: '#242745',
  color:'white'
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0, 0),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function Sidebar() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { sideBar } = useSelector((state) => state.customize);
  const { userInfo } = useSelector((state) => state.auth);

  const [open, setOpen] = React.useState(false);
  
  const location = useLocation();
  const dispatch = useDispatch();
  const activeRoute = location.pathname;

  const handleDrawerOpen = () => {
    document.getElementById('logo').src = LogoBig;
    setOpen(true);
    dispatch(setSideBarStatus({status:true})); 
  };

  const handleDrawerClose = () => {
    document.getElementById('logo').src = Logo;
    setOpen(false);
    dispatch(setSideBarStatus({status:false})); 
  };

  React.useEffect(() => {
    setOpen(sideBar ? sideBar.status : false);
  },[isSmallScreen]);
  
  return (
    <Box sx={{ display: 'flex' }} id='sideBarBox'>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <Link to='/'><Image src={open ? LogoBig : Logo} height='70px' id="logo"/></Link>
          {open ? <div onClick={handleDrawerClose} className={sideBarStyles.closeMenuBtn}><MenuOpenRounded /></div> : <></>}
        </DrawerHeader>
        <Divider />
        <List>
          <Link to='/dashboard' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${activeRoute === '/dashboard' ? sideBarStyles.active : ''}`}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white',  }}>
                <HomeRounded />
              </ListItemIcon>
              <ListItemText primary={"Dashboard"} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem></Link>
          
          <Link to='/profile' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'initial', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${activeRoute === '/profile' ? sideBarStyles.active : ''}`}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white' }}>
                <Person />
              </ListItemIcon>
              <ListItemText primary={"Profile"} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem></Link>
          
          {userInfo.userType == 'owner' ?  //Navigations for Owner

          <>
            <Link to='/owner/boardings' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'initial', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${(activeRoute == '/owner/boardings' || activeRoute == '/owner/boardings/add') ? sideBarStyles.active : ''}`}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white' }}>
                  <HomeWorkRounded />
                </ListItemIcon>
                <ListItemText primary={"My Boardings"} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem></Link>

            <Link to='/owner/utility' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'initial', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${(activeRoute == '/owner/utility' || activeRoute == '/owner/utility/add') ? sideBarStyles.active : ''}`}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white' }}>
                  <RiWaterFlashFill style={{fontSize:'1.5em'}}/>
                </ListItemIcon>
                <ListItemText primary={"Utilities"} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem></Link>

            <Link to='/owner/ingredient' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'initial', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${(activeRoute == '/owner/ingredient' || activeRoute == '/owner/ingredient/add' || activeRoute == '/owner/ingredient/update') ? sideBarStyles.active : ''}`}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white' }}>
                  <Kitchen/>
                </ListItemIcon>
                <ListItemText primary={"Kitchen"} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem></Link>
          </>

          : <></>}
          
          {userInfo.userType == 'occupant' ?  //Navigations for Occupants

          <>
            <Link to='/occupant/boarding' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'initial', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${activeRoute == '/occupant/boarding' ? sideBarStyles.active : ''}`}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white' }}>
                  <HomeWorkRounded />
                </ListItemIcon>
                <ListItemText primary={"My Boarding"} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem></Link>

            <Link to='/occupant/payment/' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'initial', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${(activeRoute == '/occupant/payment/') ? sideBarStyles.active : ''}`}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white' }}>
                <MonetizationOn />
                </ListItemIcon>
                <ListItemText primary={"Payments"} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem></Link>

            <Link to='/occupant/ticket' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'initial', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${(activeRoute == '/occupant/ticket' || activeRoute == '/occupant/ticket/create') ? sideBarStyles.active : ''}`}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white' }}>
                <ContactSupportRounded />
              </ListItemIcon>
              <ListItemText primary={"My Tickets"} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
            </ListItem></Link>

            <Link to='/occupant/feedback' style={{textDecoration:'none', color:'white'}}><ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'initial', px: 2.5, }} className={`${sideBarStyles.itmBtn} ${(activeRoute == '/occupant/feedback' || activeRoute == '/occupant/feedback/create') ? sideBarStyles.active : ''}`}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'white' }}>
              <RateReviewRounded />
              </ListItemIcon>
              <ListItemText primary={"My Feedbacks"} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
            </ListItem></Link>
          </>

          : <></>}
        </List>
      </Drawer>
      {open ? <></> : <div id="smMenuBtn" onClick={handleDrawerOpen} style={{left: `calc(${theme.spacing(7)} + 9px)`}} className={sideBarStyles.openMenuBtn}><MenuRounded /></div>}
    </Box>
  );
}