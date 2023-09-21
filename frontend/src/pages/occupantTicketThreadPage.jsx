import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col} from 'react-bootstrap';
import { Breadcrumbs, Typography, Link, Card, CardContent, } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useParams } from 'react-router';
import { useGetTicketByUniqueIdMutation } from "../slices/ticketsApiSlices";
import { toast } from "react-toastify";

const OccupantTicketThreadPage = () => {

    const {ticketId} = useParams();
    const[ticket, setTicket] = useState("");
    
    
    const { userInfo } = useSelector((state) => state.auth);
    //useffects run when the page loads
    useEffect(() => {
        loadData();
    },[]);

    const [getTicketByUniqueID, { isLoading }] = useGetTicketByUniqueIdMutation();

    const loadData = async () => {
        try{
            const res = await getTicketByUniqueID( ticketId ).unwrap();
            setTicket(res.ticket);

            
        } catch(err){
            toast.error(err.data?.message || err.error);
        }
    }

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
                                <Link underline="hover" key="3" color="inherit" href="/occupant/ticket">My Tickets</Link>,

                                <Typography key="4" color="text.primary">{ticket.subject}</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>


                    <Row>
                        <Col>
                            <Card variant="outlined" className={occupantAllTicketsStyles.card}>
                                <CardContent>
                                    <h4>{ticket.subject}</h4>
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>

                    <Row style={{marginTop:"10px"}}>
                        <Col>
                            <Card variant="outlined" >
                                <CardContent style={{padding:"115px"}}>
                                    
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>


                </Container>
            </div>
        
        </>
    )

}

export default OccupantTicketThreadPage;