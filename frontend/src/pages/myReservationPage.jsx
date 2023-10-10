import React from "react";
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Link, CircularProgress, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Container, Row, Col, } from 'react-bootstrap';
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useSelector, } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import MyReservationComponent from "../components/myReservationComponent";
import MyReservationHistoryComponent from "../components/myReservationHistoryComponent";

const MyReservationPage = () => {

  const [value, setValue] = useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
  }, []);





  return (
    <>
      <Sidebar />
      <Container>
        <Row >

          <Col>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
              <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
              <Typography key="2" color="text.primary">My Boarding</Typography>
            </Breadcrumbs>
          </Col>

        </Row>
        <Row style={{marginTop: '25px'}}>

          <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                  <Tab label="My Reservation" value="1" />
                  <Tab label="Reservation History" value="2" />
                </TabList>
              </Box>
              <TabPanel value="1"><MyReservationComponent/></TabPanel>
              <TabPanel value="2"><MyReservationHistoryComponent/></TabPanel>
            </TabContext>
          </Box>

        </Row>

      </Container>
    </>
  );
};

export default MyReservationPage;