import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetUserTicketsMutation } from "../slices/ticketsApiSlices";
import { toast } from "react-toastify";
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent,Link, Button, Paper, InputBase, IconButton, Box, FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import { NavigateNext, Search, GridViewRounded } from '@mui/icons-material';
import { DateRange } from 'react-date-range';
import occupantAllTicketsStyles from '../styles/occupantAllTicketsStyles.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { fontFamily } from "@mui/system";
import { formatDistanceToNow } from 'date-fns';

const OccupantAllTickets = () =>{

    const [tickets, setTickets] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState('');
    const [pageSize, setPageSize] = useState(5);
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const TimeAgo = ( date ) => {
        const formattedDate = formatDistanceToNow(date, { addSuffix: true });
        
        return formattedDate;
      }

    const { userInfo } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    const [getUserTickets, { isLoading }] = useGetUserTicketsMutation();
    
    const loadData = async (pageNo) => {
        try{
            
            const res = await getUserTickets( {id:userInfo._id, pageNo, pageSize} ).unwrap();
            setTickets(res.tickets);
            setTotalPages(res.totalPages);
            console.log(res.tickets[0]);
        } catch(err){
            toast.error(err.data?.message || err.error);
        }

    }

    useEffect(() => {
        loadData(page);
    },[]);

    const handlePageChange = (event, value) =>{
        setPage(value);
        loadData(value);
        console.log(tickets);
    }

    const handleDateRangeSelect = (ranges) =>{
        console.log(ranges);
        setStartDate(ranges.selection.startDate);
        setEndDate(ranges.selection.endDate);
    }

    const selectionRange = {
        startDate,
        endDate,
        key: 'selection',
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
                                <Link underline="hover" key="3" color="inherit" href="#">Tickets</Link>,
                                <Typography key="4" color="text.primary">All Tickets</Typography>
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
                                                inputProps={{ 'aria-label': 'search google maps' }}
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
                            <Col><div style={{border: '1px solid #00000066', padding:'15px'}}>Filter Ticket By: </div></Col>
                            <Col>
                                <Box sx={{ minWidth: 120 }}>
                                    <FormControl fullWidth>
                                        <InputLabel >Category</InputLabel>
                                        <Select
                                        value={category}
                                        label="category"
                                        onChange={(event) => setCategory(event.target.value)}
                                        >
                                        <MenuItem value={'boarding'}>Boarding Issue</MenuItem>
                                        <MenuItem value={'food'}>Food Issue</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Col>
                            <Col> 
                                <Box sx={{ minWidth: 120 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Sub Category</InputLabel>
                                        {category=='boarding' ? 
                                            <Select
                                            value={subCategory}
                                            label="subcategory"
                                            onChange={(event) => setSubCategory(event.target.value)}
                                            >
                                                <MenuItem value={'utilities'}>Utilities</MenuItem>
                                                <MenuItem value={'payments'}>Payment Issue</MenuItem>
                                                <MenuItem value={'other'}>Other</MenuItem>
                                            </Select>
                                        :
                                        category=='food' ?
                                            <Select
                                            value={subCategory}
                                            label="subcategory"
                                            onChange={(event) => setSubCategory(event.target.value)}
                                            >
                                                <MenuItem value={'payments'}>Payment Issue</MenuItem>
                                                <MenuItem value={'quality'}>Quality Control</MenuItem>
                                                <MenuItem value={'other'}>Other</MenuItem>
                                            </Select>
                                        :
                                            <Select
                                            value={subCategory}
                                            label="subcategory"
                                            onChange={(event) => setSubCategory(event.target.value)}
                                            >
                                                <MenuItem >Select a Category first</MenuItem>
                                            </Select>
                                        }
                                    </FormControl>
                                </Box>
                            </Col>

                            <Col>
                                <Box sx={{ minWidth: 120, minHeight:50 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={status}
                                            label="Status"
                                            onChange={(event) => setStatus(event.target.value)}
                                        >
                                            <MenuItem value={'Resolved'}>Resolved</MenuItem>
                                            <MenuItem value={'Pending'}>Pending</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            
                            </Col>

                            <Col>
                                <Box sx={{ minWidth: 120, minHeight:50 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Date</InputLabel>
                                        <Select
                                            label="Date"
                                        >
                                            <DateRange
                                                ranges={[selectionRange]}
                                                onChange={handleDateRangeSelect}
                                            />
                                        </Select>
                                    </FormControl>
                                </Box>                               
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                             <Table striped bordered hover className={occupantAllTicketsStyles.table}>
                                <thead>
                                        <tr style={{textAlign:'center'}}>
                                            <th>Reference Id</th>
                                            <th>Ticket Details</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket, index) => (
                                        <tr key={index} onClick={() => navigate('/')}>
                                            <td>{ticket.ticketId}</td>
                                            <td>
                                                <Row>
                                                    <Col style={{fontStyle:'italic', fontSize:'medium' , fontWeight:'600' }}>
                                                        {ticket.subject}
                                                    </Col>
                                                </Row>
                                                <Row style={{fontSize:'small', fontWeight:'200 !important', fontStyle:'normal', color:'dimgray'}}>
                                                    <Col lg={3}>{new Date(ticket.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', /*hour: '2-digit', minute: '2-digit', second: '2-digit' */})}</Col>
                                                    <Col lg={3}><GridViewRounded fontSize="small" />&nbsp;{ticket.category}</Col>
                                                    <Col lg={3}>{TimeAgo(new Date(ticket.createdAt))}</Col>
                                                </Row>
                                            </td>
                                            <td>    
                                                <Card variant="outlined" className={`${occupantAllTicketsStyles.cardStatus} ${ticket.status=='Pending' ? occupantAllTicketsStyles.yellowBG : occupantAllTicketsStyles.greenBG}`}>
                                                    <CardContent style={{padding:"6px"}}>
                                                        {ticket.status}
                                                    </CardContent>
                                                </Card>
                                             </td>
                                            <td>
                                                <Row>
                                                    <Col lg={6}></Col>
                                                    <Col lg={6}></Col>
                                                </Row>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            </Col>
                        </Row>
                </Container>
            </div>
        </>
    )

    




}

export default OccupantAllTickets;