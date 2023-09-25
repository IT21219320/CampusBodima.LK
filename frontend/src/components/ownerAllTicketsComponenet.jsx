import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetOwnerTicketsMutation, useSearchTicketMutation } from "../slices/ticketsApiSlices";
import { toast } from "react-toastify";
import { Row, Col, Table} from 'react-bootstrap';
import { Card, CardContent, Box, FormControl, InputLabel, Select, MenuItem, TablePagination, CircularProgress, Button} from '@mui/material';
import { GridViewRounded,GetAppRounded } from '@mui/icons-material';
import { DateRange } from 'react-date-range';
import ownerAllTicketsStyles from '../styles/ownerAllTicketsStyles.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { formatDistanceToNow } from 'date-fns';
import jsPDF from 'jspdf';


const OwnerAllTickets = ({search}) =>{

    const [tickets, setTickets] = useState([]);
    const [page, setPage] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [category, setCategory] = useState('all');
    const [subCategory, setSubCategory] = useState('all');
    const [status, setStatus] = useState('all');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [date, setDate] = useState('all');
    const [newSearch, setNewSearch] = useState('');

    const TimeAgo = ( date ) => {
        const formattedDate = formatDistanceToNow(date, { addSuffix: true });
        
        return formattedDate;
    }

    const { userInfo } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    const [getOwnerTickets, { isLoading }] = useGetOwnerTicketsMutation();
    const [searchTicket, { isLoading2 }] = useSearchTicketMutation();
    
    const loadData = async () => {
        try{
            const res = await getOwnerTickets( {id:userInfo._id, page, rowsPerPage, category, subCategory, status, startDate, endDate, date, search} ).unwrap();
            setTickets(res.tickets);
            setTotalRows(res.totalRows);
        } catch(err){
            toast.error(err.data?.message || err.error);
        }
    }

    useEffect(() => {
        loadData();

        if(totalRows < rowsPerPage){
            setPage(0);
        }

        /*if(search != newSearch){
            setNewSearch(search);
            handleSearch(search);
        } 
        else{
            loadData();
        }*/

    },[page,rowsPerPage,category, subCategory, status, startDate, endDate, date, search]);  //when the values that are inside the box brackets change,each time loadData function runs

    const handleDateRangeSelect = (ranges) =>{
        console.log(ranges);
        setStartDate(ranges.selection.startDate);
        setEndDate(ranges.selection.endDate);
        setDate('range');
    }

    const handleDateChange = (e) => {
        setDate(e.target.value);
        setStartDate(new Date());
        setEndDate(new Date());

    }

    const selectionRange = {
        startDate,
        endDate,
        key: 'selection',
    }

   const handleChangePage = (event, newPage) => {
        setPage(newPage);
   }

   const handleSearch = async(newSearch) => {

        try{
            const res = await searchTicket( {id:userInfo._id, page, rowsPerPage, newSearch} ).unwrap();
            setTickets(res.tickets);
            setTotalRows(res.totalRows);
        } catch(err){
            toast.error(err.data?.message || err.error);
        }

   }

   const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
   }

   const exportToPDF = () => {;
               
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Define the table headers
    const headers = [["Reference Id", "Subject", "Description", "Category", "Sub Category","Occupant Name" ,"Status", "Date"]];

    // Map the admin data to table rows

    const data = tickets.map((ticket) => [
      ticket.ticketId,
      ticket.subject,
      ticket.description,
      ticket.category,
      ticket.subCategory,
      ticket.senderId.firstName+ticket.senderId.lastName,
      ticket.status,
      new Date(ticket.createdAt).toLocaleString('en-GB')
    ]);

    // Set the table styles
    const styles = {
      halign: "center",
      valign: "middle",
      fontSize: 10,
    };

    // Add the table to the PDF document
    doc.autoTable({
      head: headers,
      body: data,
      styles,
      margin: { top: 70 },
      startY: 20
    });

    

    doc.text("Tickets List", 90, 10);
    doc.setFontSize(9);

    doc.save("Tiickets.pdf");

};


    return(
        <> 
             <Row>
                <Col style={{textAlign:'right'}}>
                    <Button variant="contained" style={{marginRight:'10px', background:'#4c4c4cb5'}} onClick={exportToPDF}>Export<GetAppRounded /></Button>
                </Col>
            </Row>
            <Row style={{marginTop:'20px'}}>
                <Col><div style={{border: '1px solid #00000066', padding:'12px'}}>Filter Ticket By: </div></Col>
                <Col>
                    <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                            <InputLabel >Category</InputLabel>
                            <Select
                            value={category}
                            label="category"
                            onChange={(event) => setCategory(event.target.value)}
                            >
                            <MenuItem value={'all'}>All</MenuItem>
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
                                    <MenuItem value={'all'}>All</MenuItem>
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
                                    <MenuItem value={'all'}>All</MenuItem>
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
                                    <MenuItem value={'all'}>All</MenuItem>
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
                                <MenuItem value={'all'}>All</MenuItem>
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
                                value={date}
                                onChange={handleDateChange}
                            >
                                <MenuItem value={'all'} style={{marginBottom:'10px'}}>All Time</MenuItem>
                                <MenuItem value={'range'} hidden>{startDate.toLocaleDateString('en-US')} - {endDate.toLocaleDateString('en-US')}</MenuItem>
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
                    <Table striped bordered hover className={ownerAllTicketsStyles.table}>
                        <thead>
                                <tr style={{textAlign:'center'}}>
                                    <th>Reference Id</th>
                                    <th>Ticket Details</th>
                                    <th>Occupant Name</th>
                                    <th>Status</th>
                                </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <tr style={{width:'100%',height:'100%',textAlign: 'center'}}><td colSpan={3}><CircularProgress /></td></tr> : 
                                tickets.length > 0 ?
                                    tickets.map((ticket, index) => (
                                        <tr key={index}>
                                            <td>{ticket.ticketId}</td>
                                            <td>
                                                <Row>
                                                    <Col style={{fontStyle:'italic', fontSize:'medium' , fontWeight:'600'}}>
                                                        <span onClick={() => navigate(`/owner/ticket/${ticket._id}`)} className={ownerAllTicketsStyles.ticketSubject}>{ticket.subject}</span>
                                                    </Col>
                                                </Row>
                                                <Row style={{fontSize:'small', fontWeight:'200 !important', fontStyle:'normal', color:'dimgray'}}>
                                                    <Col lg={3}>{new Date(ticket.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', /*hour: '2-digit', minute: '2-digit', second: '2-digit' */})}</Col>
                                                    <Col lg={3}><GridViewRounded fontSize="small" />&nbsp;{ticket.category}</Col>
                                                    <Col lg={3}>{TimeAgo(new Date(ticket.createdAt))}</Col>
                                                </Row>
                                            </td>
                                            <td style={{textAlign:"center"}}>
                                                {ticket.senderId.firstName} {ticket.senderId.lastName}
                                            </td>
                                            <td>    
                                                <Card variant="outlined" className={`${ownerAllTicketsStyles.cardStatus} ${ticket.status=='Pending' ? ownerAllTicketsStyles.yellowBG : ownerAllTicketsStyles.greenBG}`}>
                                                    <CardContent style={{padding:"6px"}}>
                                                        {ticket.status}
                                                    </CardContent>
                                                </Card>
                                            </td>
                                            {/*<td>
                                                <Row style={{textAlign:"center"}}>
                                                    <Col>
                                                        <Button className={ownerAllTicketsStyles.actionBtns} onClick={() => navigate(`/occupant/ticket/update/${ticket._id}`)}><FiEdit style={{color:"#3366ff" }} /></Button>
                                                        <Button><RiDeleteBinLine style={{color:"#f73b54"}}/></Button>
                                                    </Col>
                                                </Row>
                                            </td>*/}
                                        </tr>
                                    ))
                                :
                                <tr style={{height:'100%', width:'100%',textAlign:'center',color:'dimgrey'}}>
                                    <td colSpan={3}><h2>You don't have any tickets!</h2></td>
                                </tr>
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>

            <Row>
                <Col>
                    <TablePagination
                        component="div"
                        count={totalRows}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Col>
            </Row>            
        </>
    )

    




}

export default OwnerAllTickets;