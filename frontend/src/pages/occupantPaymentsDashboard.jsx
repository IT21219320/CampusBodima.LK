import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate, Link as ReactLink } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Card, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select, Link } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useGetCardByUserMutation, useDeleteCardMutation, useUpdateCardMutation } from "../slices/cardApiSlice";
import { useGetPaymentByUserMutation, useGetToDoPaymentMutation, useGetMyResMutation, useGetToDoPaymentOldMutation, useGetAllToDoPaymentByIdMutation } from "../slices/paymentApiSlice";
import occupantDashboardPaymentStyles from "../styles/occupantDashboardPaymentStyles.module.css";
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
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import { BarChart } from '@mui/x-charts/BarChart';


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

const searchBar = {
    padding: "1%",
    borderRadius: "20px",
    margin: "4% 2% 0px 2%",
    width: "95%",
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' x=\'0px\' y=\'0px\' width=\'100\' height=\'100\' viewBox=\'0 0 50 50\'%3E%3Cpath d=\'M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z\'%3E%3C/path%3E%3C/svg%3E")',
    backgroundPosition: '96% center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '26px 26px',
    border: "1px black solid",
}

const OccupantPaymentDash = () => {

    const { userInfo } = useSelector((state) => state.auth);

    const [cards, setCards] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [deleteC, setDeleteCard] = useState('');
    const [updateC, setUpdateCard] = useState('');

    const [open, setOpen] = useState(false);
    const [cardIdR, setCardIdR] = useState('');
    const [cardid, setCardid] = useState();
    const [cardNumberF, setcardNumberF] = useState('');
    const [expireDate, setexpireDate] = useState('');
    const [cvvF, setcvvF] = useState('');
    const [toDoPayment, setToDoPayment] = useState([]);
    const [toDoPaymentOld, setToDoPaymentOld] = useState([]);
    const [allToDoPaymentOld, setAllToDoPaymentOld] = useState([]);
    const [searchQ, setsearchQ] = useState('');
    const [monthQ, setMonthQ] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [myReserve, setMyReserve] = useState([]);
    //tabViews
    const [value, setValue] = useState('1');
    let bId
    if (myReserve) {
        bId = myReserve.boardingId
    }
    //Chart
    const xAxisData = []
    const mpData = []
    
    if(allToDoPaymentOld.length>0){
        
        for(const i of allToDoPaymentOld){
            console.log(i.amount);
            xAxisData.push(i.month)
            mpData.push(parseInt(i.amount))
        }
        console.log(mpData);
    }
    




    const navigate = useNavigate();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    //Mutations
    const [getCard] = useGetCardByUserMutation();
    const [getPayment] = useGetPaymentByUserMutation();
    const [deleteCard] = useDeleteCardMutation();
    const [updateCard] = useUpdateCardMutation();
    const [getToDoPayment] = useGetToDoPaymentMutation();
    const [getReserv] = useGetMyResMutation();
    const [getToDoPaymentOld] = useGetToDoPaymentOldMutation();
    const [getAllToDoPayments] = useGetAllToDoPaymentByIdMutation();



    const [openDAlert, setOpenDAlert] = useState(false);

    const handleClickOpenAlert = (id) => {
        setCardid(id)
        setOpenDAlert(true);
    };

    const handleCloseAlert = () => {
        setOpenDAlert(false);
    };

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
            setIsLoading(false)

        } catch (error) {

            console.error('Error getting cards', error);

        }
        try {
            setIsLoading(true)
            const resGetPay = await getPayment({ userInfo_id: userInfo._id, oId: searchQ, month: monthQ }).unwrap();
            setPayments(resGetPay.payments);
            setIsLoading(false)

        } catch (error) {

            console.error('Error getting payments', error);
        }

        try {

            const resGetToDOPay = await getToDoPayment({ userInfo_id: userInfo._id }).unwrap();
            setToDoPayment(resGetToDOPay);
            setIsLoading(false)

        } catch (error) {

            console.error('Error getting To Do payments', error);

        }
        try {

            const resGetAllToDOPay = await getAllToDoPayments({ userInfo_id: userInfo._id }).unwrap();
            setAllToDoPaymentOld(resGetAllToDOPay);
            setIsLoading(false)

        } catch (error) {

            console.error('Error getting All To Do payments', error);

        }
        try {

            const userInfo_id = userInfo._id
            const myReserv = await getReserv({ _id: userInfo_id }).unwrap();
            setMyReserve(myReserv)
            setIsLoading(false)

        } catch (error) {
            console.log("Error in my reservration", error)
        }

        try {

            const myOldPay = await getToDoPaymentOld({ userInfo_id: userInfo._id }).unwrap();
            setToDoPaymentOld(myOldPay[0])
            setIsLoading(false)

        } catch (error) {
            console.log(error)
        }

    }

    useEffect(() => {

        loadData();
    }, [deleteC, updateC, searchQ, monthQ]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };



    const handleRemove = async (cardId) => {
        try {
            const resDelete = await deleteCard({ cNo: cardId }).unwrap();
            setOpenDAlert(false);
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

    const navigateToPay = () => {
        navigate(`/occupant/makeMonthlyPayment/${bId}/${toDoPayment.length > 0 && toDoPayment[0].amount}/${toDoPayment.length > 0 && toDoPayment[0]._id}`)
    }

    const navigateToPayOld = () => {
        navigate(`/occupant/makeMonthlyPayment/${bId}/${toDoPaymentOld && toDoPaymentOld.amount}/${toDoPaymentOld && toDoPaymentOld._id}`)
    }

    const navigateToPayI = () => {
        navigate(`/occupant/makePayment/${bId}`)
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
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/occupant/payment/">Payments</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/occupant/payment/">View</Link>,
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Box sx={{ width: '100%', typography: 'body1', marginTop: '10px' }}>
                        <TabContext value={value}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleChange} aria-label="lab API tabs example">
                                    <Tab label="Monthly payment Summary" value="1" />
                                    <Tab label="Cards" value="2" />
                                    <Tab label="Transactions" value="3" />
                                </TabList>
                            </Box>
                            <TabPanel value="1"><Row>
                                <Col>
                                    <Row style={{ marginTop: '20px' }}>
                                        <Col>
                                            <h4 style={{ backgroundColor: "#242745", padding: "1%", borderRadius: " 10px", color: "white", textAlign: "center" }}>Monthly Payment</h4>
                                        </Col>

                                    </Row>
                                </Col>
                            </Row>
                                {isLoading ? (
                                    <>
                                        <Box sx={{ margin: '10% 50%' }}>
                                            <CircularProgress />
                                        </Box>
                                    </>) : (
                                    <>
                                        {myReserve ? (
                                            <>
                                                {myReserve.paymentStatus == 'Pending' && myReserve.paymentType == 'Online' ? (
                                                    <>
                                                        <Row>
                                                            <p>Payment is pending. Do your Initial payment in here</p>
                                                            <Button onClick={navigateToPayI}>Pay</Button>
                                                        </Row>

                                                    </>) : (
                                                    <><Row style={{ paddingLeft: "2%", paddingRight: "2%" }}>
                                                        <Col style={{ backgroundColor: "#cfd8fa", padding: "2%", borderRadius: "20px", boxShadow: "2px 2px 9px #b4b4b4", marginRight: "2%" }}>
                                                            <Row>
                                                                <h4 style={{ textAlign: " center" }}>This Month Fees </h4>
                                                                <hr style={{}} />
                                                            </Row>
                                                            {toDoPayment.length > 0 ? (<><Row>
                                                                <h5>Total Fee {toDoPayment.length > 0 && toDoPayment[0].amount}</h5>
                                                            </Row>
                                                                <Row style={{ marginLeft: "68%" }}>

                                                                    <Button variant="contained" style={{}} onClick={() => navigateToPay()}>Pay your Fee</Button>

                                                                </Row>
                                                            </>) : (
                                                                <>
                                                                    <p>You have done the payment</p>
                                                                </>)}

                                                        </Col>
                                                        <Col style={{ backgroundColor: "#ffcaca", padding: "2%", borderRadius: "20px", boxShadow: "2px 2px 9px #b4b4b4", marginLeft: "2%" }}>
                                                            <Row>
                                                                <h4 style={{ textAlign: " center" }}>Previous Month Fees </h4>
                                                                <hr />
                                                            </Row>
                                                            {toDoPaymentOld ? (<><Row>
                                                                <h5>Total Fee {toDoPaymentOld && toDoPaymentOld.amount}</h5>
                                                            </Row>
                                                                <Row style={{ marginLeft: "68%" }}>

                                                                    <Button variant="contained" style={{}} onClick={() => navigateToPayOld()}>Pay your Fee</Button>

                                                                </Row></>) : (<><p>You have done the payment</p></>)}

                                                        </Col></Row></>)}
                                                        {mpData.length>0 ? (<><BarChart
                                                    xAxis={[{ scaleType: 'band', data: xAxisData, paddingInner: 0, paddingOuter: 0 }]}
                                                    series={[{ data: mpData }]}
                                                    width={500}
                                                    height={300}
                                                /></>):(<></>)}
                                                
                                            </>) : (<>
                                                No Reservation</>)}</>)}



                            </TabPanel>
                            <TabPanel value="2"><Row>
                                <Col>
                                    <Row style={{ marginTop: '20px' }}>
                                        <Col>
                                            <h4 style={{ backgroundColor: "#242745", padding: "1%", borderRadius: " 10px", color: "white", textAlign: "center" }}>Saved cards</h4>
                                        </Col>
                                    </Row>
                                    {cards.length > 0 ? (
                                        <Row style={{ overflow: 'scroll', marginLeft: 0, marginRight: 0, flexWrap: 'nowrap', marginTop: '10px', paddingBottom: '15px' }}>
                                            {cards.map((card) => (

                                                <Col key={card.id}>
                                                    <Box key={card.id} sx={{ minWidth: 275, maxWidth: 340 }} className={occupantDashboardPaymentStyles.cardStyles2}>
                                                        <Card variant="outlined" className={occupantDashboardPaymentStyles.cardStyles}>
                                                            <div key={card.id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ minHeight: '160px', marginTop: "20px" }}>

                                                                <p><span style={cardLabelsStyle}>Card Number : </span>{card.cardNumber}</p>
                                                                <p><span style={cardLabelsStyle}>Expire Date : </span>{card.exNumber}</p>
                                                                <p><span style={cardLabelsStyle}>CVV : </span>{card.cvv}</p>

                                                                {isHovered && (
                                                                    <div key={card.id} style={{ float: "right" }}>
                                                                        <Button variant="text" onClick={() => handleClickOpen(card.cardNumber)}>Update</Button>
                                                                        <Button variant="text" color="error" onClick={() => handleClickOpenAlert(card.id)}>Remove</Button>
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
                                                <center><p>No cards to display</p></center>
                                            </Col>
                                        </Row>
                                    )}
                                </Col>
                            </Row><Dialog open={open} onClose={handleClose}>
                                    <center><DialogTitle> Update Your card </DialogTitle></center>
                                    <Form onSubmit={updateCardDetails}>
                                        <DialogContent>

                                            <Row>
                                                <TextField autoFocus margin="dense" id="name" label="card number" required value={cardNumberF} onChange={(e) => setcardNumberF(e.target.value)} inputProps={{ maxLength: 16, minLength: 16, inputMode: 'numeric', title: 'Card number should be 16 digit' }} />
                                            </Row>
                                            <Row>
                                                <TextField autoFocus margin="dense" id="name" label="Expire date" required value={expireDate} onChange={(e) => setexpireDate(e.target.value)} inputProps={{ pattern: '^(0[1-9]|1[0-2])\/[0-9]{2}$', title: 'Please enter a valid date in the format MM/YY' }} />
                                            </Row>
                                            <Row>
                                                <TextField autoFocus margin="dense" id="name" label="CVV" required value={cvvF} onChange={(e) => setcvvF(e.target.value)} inputProps={{ maxLength: 3, minLength: 3, inputMode: 'numeric', title: 'Card number should be 16 digit' }} />
                                            </Row>

                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleClose}>Cancel</Button>
                                            <Button type="submit" onClick={handleClose}>Update</Button>
                                        </DialogActions>
                                    </Form>
                                </Dialog>
                                <Dialog
                                    open={openDAlert}
                                    onClose={handleCloseAlert}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >

                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            You Sure to delete the card
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseAlert}>Cancel</Button>
                                        <Button onClick={() => handleRemove(cardid)} autoFocus>
                                            Confirm
                                        </Button>
                                    </DialogActions>
                                </Dialog></TabPanel>
                            <TabPanel value="3"><Row>
                                <Col>
                                    <Row style={{ marginTop: '20px' }}>
                                        <Col>
                                            <h4 style={{ backgroundColor: "#242745", padding: "1%", borderRadius: " 10px", color: "white", textAlign: "center" }}>Transactions</h4>
                                        </Col>

                                    </Row>
                                </Col>
                            </Row>


                                <Row>
                                    <Col>
                                        <input
                                            type="number"
                                            value={searchQ}
                                            placeholder="Search By Amount..." style={searchBar}
                                            onChange={(e) => setsearchQ(e.target.value)}
                                        />
                                    </Col>
                                    <Col>
                                        <FormControl sx={{ m: 1, minWidth: 120, margin: "4% 0px 0px 0px" }} size="small">
                                            <InputLabel id="demo-simple-select-label">Month</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={monthQ}
                                                label="Month"
                                                onChange={(e) => setMonthQ(e.target.value)}
                                            >
                                                <MenuItem value={""}>All</MenuItem>
                                                <MenuItem value={"January"}>January</MenuItem>
                                                <MenuItem value={"February"}>February</MenuItem>
                                                <MenuItem value={"March"}>March</MenuItem>
                                                <MenuItem value={"April"}>April</MenuItem>
                                                <MenuItem value={"May"}>May</MenuItem>
                                                <MenuItem value={"June"}>June</MenuItem>
                                                <MenuItem value={"July"}>July</MenuItem>
                                                <MenuItem value={"Auguest"}>Auguest</MenuItem>
                                                <MenuItem value={"September"}>September</MenuItem>
                                                <MenuItem value={"Octomber"}>Octomber</MenuItem>
                                                <MenuItem value={"November"}>November</MenuItem>
                                                <MenuItem value={"December"}>December</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Col>
                                </Row>
                                <Row>
                                    {isLoading ? (<>
                                        <Box sx={{ margin: '10% 50%' }}>
                                            <CircularProgress />
                                        </Box></>) : (<>
                                            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                                                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <StyledTableCell>Transaction ID</StyledTableCell>
                                                            <StyledTableCell align="right">Amount</StyledTableCell>
                                                            <StyledTableCell align="right">Description</StyledTableCell>
                                                            <StyledTableCell align="right">For</StyledTableCell>
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
                                                                    <StyledTableCell align="right" >LKR {payment.amount}</StyledTableCell>
                                                                    <StyledTableCell align="right" >{payment.description}</StyledTableCell>
                                                                    <StyledTableCell align="right" >{payment.payableMonth}</StyledTableCell>
                                                                    <StyledTableCell align="right"> {new Date(payment.date).toDateString()}</StyledTableCell>

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
                                            </TableContainer></>)}

                                </Row></TabPanel>
                        </TabContext>
                    </Box>
                </Container>
            </div>
        </>
    )
}

export default OccupantPaymentDash