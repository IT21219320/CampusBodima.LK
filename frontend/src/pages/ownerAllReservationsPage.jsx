import * as React from 'react';
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { NavigateNext, Try } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetBoardingsByIdMutation } from '../slices/reservationsApiSlice.js';
import PendingReservations from '../components/pendingReservationsComponent';
import ViewAllReservations from '../components/viewAllReservationsComponent';
import BoardingReservationHistory from '../components/BoardingReservationHistoryComponent';

import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';

const OwnerAllReservations = () => {

    const { userInfo } = useSelector((state) => state.auth);

    const [boarding, setBoarding] = useState([]);
    const [boardingID, setBoardingID] = useState('');

    const [getOwnerBoarding] = useGetBoardingsByIdMutation();

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const loadData = async () => {
        try {
            const resBoardings = await getOwnerBoarding({ ownerId: userInfo._id }).unwrap();
            if (resBoardings) {
                setBoarding(resBoardings.ownerBoardings);

            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">Reservations</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>

                    <Row style={{marginTop:'33px', marginLeft:'2px', width:'25%'}}>
                        <InputLabel id="demo-simple-select-standard-label" >Boarding</InputLabel>
                        <Select
                            labelId="demo-simple-select-standard-label"
                            size="small"
                            id="demo-simple-select-standard"
                            value={boardingID}
                            onChange={(e) => setBoardingID(e.target.value)}
                            label="Boardings"

                        >{boarding.length > 0 ? (
                            boarding.map((boarding) => (
                                <MenuItem key={boarding._id} value={boarding._id}>
                                    <em>{boarding.boardingName}</em>
                                </MenuItem>

                            ))

                        ) : (
                            <MenuItem value="">
                                <em>No reservation</em>
                            </MenuItem>)}

                        </Select>

                    </Row>
                    <Row style={{marginTop: '25px'}}>
                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <TabContext value={value}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                                        <Tab label="Pendings" value="1" />
                                        <Tab label="All Reservations" value="2" />
                                        <Tab label="History" value="3" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1"><PendingReservations bId={boardingID} /></TabPanel>
                                <TabPanel value="2"><ViewAllReservations bId={boardingID} /></TabPanel>
                                <TabPanel value="3"><BoardingReservationHistory bId={boardingID} /></TabPanel>
                            </TabContext>
                        </Box>
                    </Row>

                </Container>
            </div>
        </>
    )

}

export default OwnerAllReservations;