import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate, Link as ReactLink } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Card, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select, Link } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useGetCardByUserMutation, useDeleteCardMutation, useUpdateCardMutation } from "../slices/cardApiSlice";
import { useGetPaymentByUserMutation } from "../slices/paymentApiSlice";
import { async } from "@firebase/util";
import occupantDashboardPaymentStyles from "../styles/occupantDashboardPaymentStyles.module.css"
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';


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

const cardLabelsStyle = {
    fontFamily: "Lucida Console"
}

const OccupantPaymentDash = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const [cards, setCards] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [deleteC, setDeleteCard] = useState('');
    const [updateC, setUpdateCard] = useState('');
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [cardIdR, setCardIdR] = useState('');

    const [cardNumberF, setcardNumberF] = useState('');
    const [expireDate, setexpireDate] = useState('');
    const [cvvF, setcvvF] = useState('');

    const [getCard] = useGetCardByUserMutation();
    const [getPayment] = useGetPaymentByUserMutation();
    const [deleteCard] = useDeleteCardMutation();
    const [updateCard] = useUpdateCardMutation();



    const [openDAlert, setOpenDAlert] = useState(false);


    const handleClickOpen = (id) => {
        setOpen(true);
        setCardIdR(id)
    };

    const handleClose = () => {
        
        setOpen(false);
    };

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
    }, [deleteC,updateC]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };



    const handleRemove = async (cardId) => {
        try {
            const resDelete = await deleteCard({ cNo: cardId }).unwrap();
            console.log(resDelete.message);
            setDeleteCard(resDelete.message);
            setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
        } catch (error) {
            console.error('Error deleting cards', error);
        }
    };

    const updateCardDetails = async (e) => {
        e.preventDefault();

        try {
            const resUp = await updateCard({ cNo: cardIdR, cardNumberF: cardNumberF, cvvF: cvvF, expireDate: expireDate }).unwrap();
            setUpdateCard(resUp);
            
        } catch (error) {
            console.log(error)
        }
    }

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
                                <Link underline="hover" key="3" color="inherit" href="/occupant/payment/">View</Link>,
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Row style={{ marginTop: '20px' }}>
                                <Col>
                                    <h4 style={{ backgroundColor: "#6d6d6d", padding: "1%", borderRadius:" 10px", color: "white", textAlign:"center"}}>Saved cards</h4>
                                </Col>
                            </Row>
                            {cards.length > 0 ? (
                                <Row style={{ overflow: 'scroll', marginLeft: 0, marginRight: 0, flexWrap: 'nowrap', marginTop: '10px', paddingBottom: '15px' }}>
                                    {cards.map((card) => (

                                        <Col key={card.id}>
                                            <Box key={card.id} sx={{ minWidth: 275, maxWidth: 340 }} className={occupantDashboardPaymentStyles.cardStyles2}>
                                                <Card variant="outlined" className={occupantDashboardPaymentStyles.cardStyles}>
                                                    <div key={card.id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ minHeight: '160px', marginTop:"20px"}}>

                                                        <p><span style={cardLabelsStyle}>Card Number : </span>{card.cardNumber}</p>
                                                        <p><span style={cardLabelsStyle}>Expire Date : </span>{card.exNumber}</p>
                                                        <p><span style={cardLabelsStyle}>CVV : </span>{card.cvv}</p>

                                                        {isHovered && (
                                                            <div key={card.id} style={{float: "right"}}>
                                                                <Button variant="text" onClick={() => handleClickOpen(card.cardNumber)}>Update</Button>
                                                                <Button variant="text" color="error" onClick={() => handleRemove(card.id)}>Remove</Button>
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
                    <Dialog open={open} onClose={handleClose}>
                        <center><DialogTitle> Update Your card </DialogTitle></center>
                        <Form onSubmit={updateCardDetails}>
                            <DialogContent>

                                <Row>
                                    <TextField autoFocus margin="dense" id="name" label="card number" value={cardNumberF} onChange={(e) => setcardNumberF(e.target.value)} inputProps={{ maxLength: 16, minLength: 16, inputMode: 'numeric', title: 'Card number should be 16 digit' }} />
                                </Row>
                                <Row>
                                    <TextField autoFocus margin="dense" id="name" label="Expire date" value={expireDate} onChange={(e) => setexpireDate(e.target.value)} inputProps={{ pattern: '^(0[1-9]|1[0-2])\/[0-9]{2}$', title: 'Please enter a valid date in the format MM/YY' }} />
                                </Row>
                                <Row>
                                    <TextField autoFocus margin="dense" id="name" label="CVV" value={cvvF} onChange={(e) => setcvvF(e.target.value)} inputProps={{ maxLength: 3, minLength: 3, inputMode: 'numeric', title: 'Card number should be 16 digit' }} />
                                </Row>

                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button type="submit" onClick={handleClose}>Update</Button>
                            </DialogActions>
                        </Form>
                    </Dialog>
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

export default OccupantPaymentDash