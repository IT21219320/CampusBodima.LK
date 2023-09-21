import { useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Tab, Tabs} from 'react-bootstrap';
import { Breadcrumbs, Typography, Card, CardContent,Link, Button, Paper, InputBase, IconButton } from '@mui/material';
import { NavigateNext, Search} from '@mui/icons-material';
import occupantAllTicketsStyles from '../styles/occupantAllTicketsStyles.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import OccupantAllTickets from "../components/occupantAllTicketsComponenet";
import OccupantPendingTickets from "../components/occupantPendingTicketsComponenet";
import OccupantResolvedTickets from "../components/occupantResolvedTicketsComponenet";

const OccupantTickets = () =>{

    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('allTickets');

    const { userInfo } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    return(
        <>
            <Sidebar />
            
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                
                                <Typography key="3" color="text.primary">My Tickets</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                    
                    <Row>
                        <Col>
                            <Card variant="outlined" className={occupantAllTicketsStyles.card}>
                                <CardContent>
                                    <h4>Tickets</h4>
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>


                    <Row>
                        <Col>
                            <Row>
                                <Col lg={6} xs={12}>
                                    <Paper
                                        component="form"
                                        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
                                        style={{background:'#e3e7ea8f'}}
                                    >
                                        <InputBase
                                            sx={{ ml: 1, flex: 1 }}
                                            placeholder="Search Tickets" 
                                            value={search}
                                            onChange={ (event) => setSearch(event.target.value)} 
                                        />
                                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                                            <Search />
                                        </IconButton>
                                    </Paper>
                                </Col>
                                <Col lg={6} xs={12} style={{textAlign:'right'}}>
                                    <Button variant="contained" onClick={() => navigate('/occupant/ticket/create')}>New Ticket</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row style={{marginTop:'20px'}}>
                        <Col>
                        
                            <Tabs
                                defaultActiveKey="allTickets"
                                id="uncontrolled-tab-example"
                                className="mb-3"
                                onSelect={(k) => setActiveTab(k)}
                            >
                                <Tab eventKey="allTickets" title="All Tickets">
                                    {activeTab=='allTickets' ? <OccupantAllTickets search={search}/*send search value to occupantAllTickets component*/ /> : ''}
                                </Tab>
                                <Tab eventKey="pending" title="Pending">
                                    {activeTab=='pending' ? <OccupantPendingTickets search={search} /> : ''}
                                </Tab>
                                <Tab eventKey="resolved" title="Resolved">
                                    {activeTab=='resolved' ? <OccupantResolvedTickets search={search}/> : ''}
                                </Tab>
                            </Tabs>

                        </Col>
                    </Row>

                </Container>
            </div>
        </>
    )

    




}

export default OccupantTickets;