import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Button, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useGetCardByUserMutation } from "../slices/cardApiSlice";


const OccupantPaymentDash = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const [cards, setCards] = useState([]);

    const [getCard] = useGetCardByUserMutation();

    const loadData = () => {
        try {
            const res =  getCard({ userInfo_id: userInfo._id }).unwrap();
            setCards(res);
        } catch (error) {
            console.error('Error getting cards', error);
        }

    }

    useEffect(() => {
        loadData();
    }, []);
    console.log(cards)
    return (
        <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>

                <Container>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/owner/ingredient">Payments</Link>,
                                <Typography key="4" color="text.primary">View</Typography>
                            </Breadcrumbs>
                        </Col>

                    </Row>
                    <Row>
                        {cards.length > 0 ? (
                            cards.map((card) => (
                                <div key={card.id} className="card">
                                    <p>{card.cardNumber}</p>
                                    <p>{card.cvv}</p>
                                    <p>{card.exNumber}</p>
                                </div>
                            ))
                        ) : (
                            <p>No cards to display</p>
                        )}
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default OccupantPaymentDash