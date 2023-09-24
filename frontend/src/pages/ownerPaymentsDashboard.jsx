import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate, Link as ReactLink } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Card, Button, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select, Link } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col } from 'react-bootstrap';
import { useGetCardByUserMutation, useDeleteCardMutation } from "../slices/cardApiSlice";
import { useGetPaymentByUserMutation } from "../slices/paymentApiSlice";
import { async } from "@firebase/util";
import occupantDashboardPaymentStyles from "../styles/occupantDashboardPaymentStyles.module.css"
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const OwnerPaymentDash = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const [cards, setCards] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [deleteC, setDeleteCard] = useState('');
    const navigate = useNavigate();

    const [getCard] = useGetCardByUserMutation();
    const [getPayment] = useGetPaymentByUserMutation();
    const [deleteCard] = useDeleteCardMutation();

    const loadData = async () => {
        try {
            const res = await getCard({ userInfo_id: userInfo._id }).unwrap();
            
            setCards(res);
            

        } catch (error) {
            console.error('Error getting cards', error);
        }
        try {
            
            const resGetPay = await getPayment({ _id: userInfo._id }).unwrap();
            
            setPayments(resGetPay.payments);

        } catch (error) {
            console.error('Error getting payments', error);
        }


    }

    useEffect(() => {
        loadData();
    }, [deleteC]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleUpdate = () => {
        // Implement the update logic here
        alert('Card number updated!');
    };

    const handleRemove = async(cardId) => {
        try {
            const resDelete = await deleteCard({ cNo: cardId  }).unwrap();
            console.log(resDelete.message);
            setDeleteCard(resDelete.message);
            setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));

        } catch (error) {
            console.error('Error deleting cards', error);
        }
    };

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
                                <Link underline="hover" key="3" color="inherit" href="/occupant/payment/">Payments</Link>,
                                <Typography key="4" color="text.primary">View</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Row style={{ marginTop: '20px' }}>
                                <Col>
                                    <h4>Saved cards</h4>
                                </Col>
                            </Row>
                            {cards.length > 0 ? (
                                <Row style={{ overflow: 'scroll', marginLeft: 0, marginRight: 0, flexWrap: 'nowrap', marginTop: '10px', paddingBottom: '15px' }}>
                                    {cards.map((card) => (

                                        <Col key={card.id}>
                                            <Box key={card.id} sx={{ minWidth: 275, maxWidth: 340 }}>
                                                <Card variant="outlined" className={occupantDashboardPaymentStyles.cardStyles}>
                                                    <div key={card.id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{minHeight: '160px'}}>
                                                    
                                                                <p>Card Number : {card.cardNumber}</p>
                                                                <p>Expire Date : {card.exNumber}</p>
                                                                <p>CVV : {card.cvv}</p>
                                                            
                                                        {isHovered && (
                                                            <div key={card.id}>
                                                                <button onClick={handleUpdate}>Update</button>
                                                                <button onClick={() => handleRemove(card.id)}>Remove</button>
                                                            </div>
                                                        )} 
                                                    </div>
                                                </Card>
                                            </Box>
                                        </Col>
                                        
                                    ))}
                                </Row>
                            ) : (
                                <Row>
                                    <Col>
                                        <p>No cards to display</p>
                                    </Col>
                                </Row>
                            )}
                        </Col>
                    </Row>

                    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                        <Table sx={{ minWidth: 700 }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Transaction ID</StyledTableCell>
                                    <StyledTableCell align="right">Amount</StyledTableCell>
                                    <StyledTableCell align="right">Description</StyledTableCell>
                                    <StyledTableCell align="right">Transaction Date</StyledTableCell>
                                    <StyledTableCell align="right">Method</StyledTableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <StyledTableRow key={payment._id}>
                                            <StyledTableCell component="th" scope="row">
                                                {payment._id}
                                            </StyledTableCell>
                                            <StyledTableCell align="right" >{payment.amount}</StyledTableCell>
                                            <StyledTableCell align="right" >{payment.description}</StyledTableCell>
                                            
                                            <StyledTableCell align="right">{payment.date}</StyledTableCell>
                                            <StyledTableCell align="right">{payment.paymentType}</StyledTableCell>
                                        </StyledTableRow>
                                    ))) : (
                                    <StyledTableRow >
                                        <StyledTableCell component="th" scope="row">
                                            No data
                                        </StyledTableCell>
                                    </StyledTableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </div>
        </>
    )
}

export default OwnerPaymentDash