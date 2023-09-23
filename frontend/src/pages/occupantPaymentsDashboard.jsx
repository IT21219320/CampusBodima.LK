import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Card, Button, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col } from 'react-bootstrap';
import { useGetCardByUserMutation } from "../slices/cardApiSlice";
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

const OccupantPaymentDash = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const [cards, setCards] = useState([]);
    const [payments, setPayments] = useState([]);
    const [getCard] = useGetCardByUserMutation();
    const [getPayment] = useGetPaymentByUserMutation();

    const loadData = async () => {
        try {
            const res = await getCard({ userInfo_id: userInfo._id }).unwrap();
            const resGetPay = await getPayment({ _id: userInfo._id }).unwrap();
            setCards(res);
            setPayments(resGetPay.payments);
            console.log(payments)
        } catch (error) {
            console.error('Error getting cards', error);
        }

    }

    useEffect(() => {
        loadData();
    }, []);

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
                        <h4>Saved cards</h4>
                        {cards.length > 0 ? (
                            cards.map((card) => (
                                <Box key={card.cardNumber} sx={{ minWidth: 275, maxWidth: 340 }}>
                                    <Card variant="outlined" className={occupantDashboardPaymentStyles.cardStyles}>
                                        <div key={card.cardNumber} >
                                            <p>Card Number : {card.cardNumber}</p>
                                            <p>Expire Date : {card.exNumber}</p>
                                            <p>CVV : {card.cvv}</p>
                                        </div>
                                    </Card>
                                </Box>
                            ))
                        ) : (
                            <p>No cards to display</p>
                        )}
                    </Row>

                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 700 }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>ID</StyledTableCell>
                                    <StyledTableCell align="right">Name</StyledTableCell>
                                    <StyledTableCell align="right">Student ID</StyledTableCell>

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
                                            <StyledTableCell align="right">{payment.credited}</StyledTableCell>
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

export default OccupantPaymentDash