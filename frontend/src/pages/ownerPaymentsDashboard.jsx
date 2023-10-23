import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate, Link as ReactLink } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Card, Button, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select, Link } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Placeholder } from 'react-bootstrap';
import { useGetPaymentByOwnerMutation, useWithdrawMoneyByBoardingMutation } from "../slices/paymentApiSlice";
import { useGetBoardingsByIdMutation } from '../slices/reservationsApiSlice.js';
import occupantDashboardPaymentStyles from "../styles/occupantDashboardPaymentStyles.module.css"
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { PieChart } from '@mui/x-charts/PieChart';

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
const stylesAccount = {

    width: "100%",
    margin: "32px auto",
    borderRadius: "10px",
    background: "rgb(137 146 186)",
}

const stylesBalances = {

    borderRadius: "10px",
    height: "120px",
    margin: "3%",
    backgroundColor: "#ccddff",
    padding: "20px 20px",

}

const styleTopics = {

    fontFamily: "monospace",
    fontSize: "larger",

}



const OwnerPaymentDash = () => {
    const { userInfo } = useSelector((state) => state.auth);


    const [payments, setPayments] = useState([]);
    const [credited, setCredited] = useState();
    const [debited, setDebited] = useState();

    const [boarding, setBoarding] = useState([]);
    const [boardingID, setBoardingID] = useState('');
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [withRef, setWithRef] = useState('');
    const [errorTxt, setErrorTxt] = useState(false);

    const [january, setJanuary] = useState('');
    const [february, setfebruary] = useState('');
    const [march, setmarch] = useState('');
    const [april, setapril] = useState('');
    const [may, setmay] = useState('');
    const [june, setjune] = useState('');
    const [july, setjuly] = useState('');
    const [auguest, setauguest] = useState('');
    const [september, setseptember] = useState('');
    const [october, setoctober] = useState(0);
    const [november, setnovember] = useState('');
    const [december, setdecember] = useState('');

    const mpData = [january, february, march, april, may, june, july, auguest, september, october, november, december]
    const xAxisData = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'auguest', 'september', 'october', 'november', 'december']

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const handleWithdrawClose = async () => {
        try {

            const type = 'Cash'
            const resWith = await withdrawByBoarding({ userInfo_id: userInfo._id, bId: boardingID, amount: amount, des: desc, type: type })
            setWithRef('refresh')

        } catch (error) {
            console.log(error);
        }
        setOpen(false);
    }

    const navigate = useNavigate();

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [getPayment] = useGetPaymentByOwnerMutation();
    const [getOwnerBoarding] = useGetBoardingsByIdMutation();
    const [withdrawByBoarding] = useWithdrawMoneyByBoardingMutation();

    const loadData = async () => {
        try {
            setLoading(true)
            const resGetPay = await getPayment({ userInfo_id: userInfo._id, boId: boardingID }).unwrap();

            setPayments(resGetPay.payments);
            let totalCredit = 0;
            let totalDebited = 0;
            for (const pay of resGetPay.payments) {
                if (pay.credited) {
                    const creditedInt = parseInt(pay.credited)
                    totalCredit += creditedInt
                }

                if (pay.debited) {
                    const debitedInt = parseInt(pay.debited)
                    totalDebited += debitedInt
                    
                }


            }
            setDebited(totalDebited)
            setCredited(totalCredit)

            if (resGetPay.payments.length > 0) {

                let jan = 0, feb = 0, mar = 0, apr = 0, may = 0, jun = 0, jul = 0, aug = 0, sep = 0, oct = 0, nov = 0, dec = 0
                for (const payM of resGetPay.payments) {
                    if (payM.credited) {
                        console.log(payM.date);
                        const date = new Date(payM.date)
                        console.log(date.getMonth());
                        if (date.getMonth() == 0) {
                            jan += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 1) {
                            feb += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 2) {
                            mar += parseInt(payM.credited)
                        }
                        if (date.getMonth() == 3) {
                            apr += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 4) {
                            may += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 5) {
                            jun += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 6) {
                            jul += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 7) {
                            aug += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 8) {
                            sep += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 9) {

                            oct += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 10) {
                            nov += parseInt(payM.credited)

                        }
                        if (date.getMonth() == 11) {
                            dec += parseInt(payM.credited)

                        }
                    }

                }
                setJanuary(jan)
                setfebruary(feb)
                setmarch(mar)
                setapril(apr)
                setmay(may)
                setjune(jun)
                setjuly(jul)
                setauguest(aug)
                setseptember(sep)
                setoctober(oct)
                setnovember(nov)
                setdecember(dec)
            }

            try {

                const resBoardings = await getOwnerBoarding({ ownerId: userInfo._id }).unwrap();
                if (resBoardings) {
                    setBoarding(resBoardings.ownerBoardings);

                }
                setLoading(false)
            } catch (error) {
                console.log(error);
            }
            setLoading(false)

        } catch (error) {
            console.error('Error getting payments', error);
        }
    }

    useEffect(() => {
        loadData();
    }, [boardingID, withRef]);


    //calc 

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
                                <Link underline="hover" key="3" color="inherit" href="/">View</Link>,

                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Row style={{ marginTop: '20px' }}>
                                <Col>
                                    <h4 style={{ backgroundColor: "#242745", padding: "1%", borderRadius: " 10px", color: "white", textAlign: "center" }}>Monthly Payment</h4>
                                </Col>

                            </Row>
                        </Col>
                    </Row>
                    <Row>

                        <Col>

                            <FormControl size="small" style={{ width: '25%', margin: '6% 5% 0px 5%' }}>
                                <InputLabel id="demo-simple-select-label" >Boarding</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={boardingID}
                                    onChange={(e) => setBoardingID(e.target.value)}
                                    label="Boardings"
                                >
                                    <MenuItem value=''>
                                        <em>All</em>
                                    </MenuItem>
                                    {boarding.length > 0 ? (
                                        boarding.map((boarding) => (
                                            <MenuItem key={boarding._id} value={boarding._id}>
                                                <em>{boarding.boardingName}</em>
                                            </MenuItem>
                                        ))

                                    ) : (
                                        <MenuItem value="">
                                            <em>No Boarding</em>
                                        </MenuItem>)}

                                </Select>
                            </FormControl>
                        </Col>
                    </Row>
                    <TabContext value={value} >
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginLeft: '3%' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example" centered>
                                <Tab label="Account" value="1" />
                                <Tab label="Account statistics" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            {loading ? (<><Box sx={{ margin: '10% 50%' }}>
                                <CircularProgress />
                            </Box></>) : (<><Row style={stylesAccount}>

                                <Col>
                                    <Row style={{ marginTop: '20px' }}>
                                        <Col>
                                            <center><h4 style={{ fontFamily: 'Lucida Console', fontSize: '42px', color: '#f0f2ff' }}>My Account</h4></center>
                                        </Col>
                                        <Row >
                                            <Col style={stylesBalances}>
                                                {credited ? (
                                                    <>
                                                        <p style={styleTopics}>Credited Balance</p>
                                                        <p> LKR {credited} </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p style={styleTopics}>Credited Balance</p>
                                                        <p>  LKR 0</p>
                                                    </>
                                                )}

                                            </Col>
                                            <Col style={stylesBalances}>
                                                {debited ? (
                                                    <>
                                                        <p style={styleTopics}>Debited Balance</p>
                                                        <p>  LKR {debited} </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p style={styleTopics}>Debited Balance</p>
                                                        <p>  LKR 0 </p>
                                                    </>)}

                                            </Col >
                                            <Col style={stylesBalances}>
                                                {debited ? (
                                                    <>
                                                        <p style={styleTopics}>Total Balance</p>
                                                        <p>  LKR {credited - debited} </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p style={styleTopics}>Total Balance</p>
                                                        <p> LKR {credited}</p>
                                                    </>)}

                                            </Col>
                                        </Row>
                                        {boardingID == '' ? (<></>) : (<><Button variant="outlined" onClick={handleClickOpen} style={{ backgroundColor: '#448e36', margin: '2%', width: '21%', color: 'white', marginLeft: '71%' }}>Withdraw money </Button></>)}

                                    </Row>

                                </Col>
                            </Row>
                                <Dialog open={open} onClose={handleClose} maxWidth={'sm'} fullWidth={true}>
                                    <DialogTitle>Withdraw</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>

                                        </DialogContentText>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id="name"
                                            label="Enter Amount"
                                            type="Number"
                                            fullWidth
                                            variant="standard"
                                            value={amount}
                                            onChange={(e) => {
                                                if ((credited - debited) >= e.target.value) {
                                                    setErrorTxt(false)
                                                    setAmount(e.target.value)
                                                }
                                                else {
                                                    setErrorTxt(true)
                                                }
                                            }
                                            }
                                        />
                                        {errorTxt ? (<><p style={{ color: 'red' }}>You can't exceed your balance of LKR {credited - debited}</p></>) : (<><p>Your remaining balance LKR {credited - debited}</p></>)}

                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id="name"
                                            label="Description"
                                            type="text"
                                            fullWidth
                                            variant="standard"
                                            value={desc}
                                            onChange={(e) => setDesc(e.target.value)}
                                        />



                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleClose}>Cancel</Button>
                                        <Button onClick={handleWithdrawClose}>Withdraw</Button>
                                    </DialogActions>
                                </Dialog>
                                <Row>
                                    <Col>
                                        <Row style={{ marginTop: '20px' }}>
                                            <Col>
                                                <center><h4>Transactions</h4></center>
                                            </Col>
                                        </Row>

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
                                                <StyledTableCell align="right">Credited</StyledTableCell>
                                                <StyledTableCell align="right">Debited</StyledTableCell>
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
                                                        <StyledTableCell align="right">{new Date(payment.date).toDateString()}</StyledTableCell>
                                                        <StyledTableCell align="right">{payment.paymentType}</StyledTableCell>
                                                        <StyledTableCell align="right">{payment.credited}</StyledTableCell>
                                                        <StyledTableCell align="right">{payment.debited}</StyledTableCell>
                                                    </StyledTableRow>
                                                ))) : (
                                                <StyledTableRow >
                                                    <StyledTableCell component="th" scope="row" align="center" colSpan={7}>
                                                        No data
                                                    </StyledTableCell>

                                                </StyledTableRow>)}
                                        </TableBody>
                                    </Table>
                                </TableContainer></>)}
                        </TabPanel>
                        <TabPanel value="2">
                            <Row>
                                <Col>
                                    <center>
                                        <p style={{ fontWeight: 'bold' }}>Credited Debited Values chart</p>
                                        {payments.length > 0 ? (
                                            <>
                                                <PieChart
                                                    series={[
                                                        {
                                                            data: [
                                                                { id: 0, value: credited, label: `Credited\n ${credited}` },
                                                                { id: 1, value: debited, label: `Debited\n ${debited}` },
                                                            ],
                                                        },
                                                    ]}
                                                    width={400}
                                                    height={200}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <p style={{ marginTop: '5%' }}>No Payment details to show</p>
                                            </>
                                        )}

                                    </center>
                                </Col>

                            </Row>
                            <Row>
                                <Col>
                                    <center>
                                        <p style={{ fontWeight: 'bold' }}>Monthly credited balance </p>
                                        {payments.length > 0 ? (<>
                                            <BarChart
                                                xAxis={[{ scaleType: 'band', data: xAxisData, label: 'Month' }]}
                                                yAxis={[{ label: 'Amount' }]}
                                                series={[{ data: mpData }]}
                                                style={{ width: '100%' }}
                                                height={300}
                                            />


                                        </>
                                        ) : (
                                            <> <p style={{ marginTop: '5%' }}>No Payment details to show</p> </>
                                        )}
                                    </center>
                                </Col>
                            </Row>
                        </TabPanel>
                    </TabContext>

                </Container>
            </div>
        </>
    )
}

export default OwnerPaymentDash