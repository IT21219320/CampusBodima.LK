import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, Table} from 'react-bootstrap';
import { Card, CardContent, Pagination, CircularProgress, Box, Collapse, IconButton, Alert, Switch, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, TablePagination, Paper, InputBase, TextField, FormControl, InputLabel, Select, MenuItem, Slider, Button as MuiButton } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Close, Search, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllBoardingsMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { RiDeleteBinLine } from "react-icons/ri";
import { BiSortAlt2 } from "react-icons/bi";
import { ImSortAmountAsc, ImSortAmountDesc } from "react-icons/im";
import LoadingButton from '@mui/lab/LoadingButton';
import storage from "../utils/firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import jsPDF from 'jspdf';

import ownerStyles from '../styles/ownerStyles.module.css';

import defaultImage from '/images/defaultImage.png';

const AdminAllBoardings = () => {

    const [noticeStatus, setNoticeStatus] = useState(true);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10)
    const [totalRows, setTotalRows] = useState(0);
    const [boardings, setBoardings] = useState([]);
    const [status, setStatus] = useState('All')
    const [food, setFood] = useState('All')
    const [utilityBills, setUtilityBills] = useState('All')
    const [noOfRooms, setNoOfRooms] = useState(0)
    const [boardingType, setBoardingType] = useState('Hostel')
    const [gender, setGender] = useState('All')
    const [rentRange, setRentRange] = useState([0, 50000])
    const [rent, setRent] = useState('All')
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [date, setDate] = useState('All')
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [order, setOrder] = useState(1)
    const [confirmDialog, setConfirmDialog] = useState(false);

    let roomRentRange = [];
    let x;


    
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();

    const [getAllBoardings, { isLoading }] = useGetAllBoardingsMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
        try {
            const res = await getAllBoardings( {page, pageSize, status, food, utilityBills, noOfRooms, boardingType, gender, rentRange, rent, startDate, endDate, date, search, sortBy, order} ).unwrap();

            setTotalRows(res.totalRows)
            setBoardings(res.boardings)
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    useEffect(() => {
        
        loadData(); 

        if(totalRows < pageSize){
            setPage(0);
        }    

    },[page, pageSize, status, food, utilityBills, noOfRooms, boardingType, gender, rentRange, rent, startDate, endDate, date, search, sortBy, order]);

    const handleDialogOpen = (e, id) => {
        e.preventDefault();
        setTempDeleteId(id);
        setConfirmDialog(true);
    }

    const handleDialogClose = () => {
        setTempDeleteId('');
        setConfirmDialog(false);
    }

    const handleDateRangeSelect = (ranges) =>{
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

    const handleSortClick = (column) => {
        if (sortBy === column) {
            setOrder(order === 1 ? -1 : 1);
        } else {
            setSortBy(column);
            setOrder(1);
        }
    }

    const exportToPDF = () => {;
               
        // Create a new jsPDF instance
        const doc = new jsPDF();
    
        let headers;
        // Define the table headers
        if(boardingType=="Hostel"){
            headers = [["Boarding Name", "Boarding Type", "City", "Status", "Food", "Utility Bills", "No Of Rooms", "Gender", "Date"]];
        }
        else{
            headers = [["Boarding Name", "Boarding Type", "City", "Status", "Food", "Utility Bills", "No Of Rooms", "Gender", "Rent", "Date"]];
        }
    
        // Map the admin data to table rows
    
        const data = boardings.map((boarding) => [
            boarding.boardingName,
            boarding.boardingType,
            boarding.city,
            boarding.status,
            boarding.food ? "Yes" : "No",
            boarding.utilityBills ? "Yes" : "No",
            boarding.boardingType=='Annex' ? boarding.noOfRooms : boarding.room.length,
            boarding.gender,
            boardingType === 'Annex' ? (
                boarding.rent,
                new Date(boarding.createdAt).toLocaleString('en-GB')
            ) 
            :
            new Date(boarding.createdAt).toLocaleString('en-GB')
        ]);
    
        // Set the table styles
        const styles = {
          halign: "center",
          valign: "middle",
          fontSize: 9,
        };
    
        // Add the table to the PDF document
        doc.autoTable({
          head: headers,
          body: data,
          styles,
          margin: { top: 70 },
          startY: 50
        });
    
        
    
        doc.text("Boardings List", 85, 40);
        doc.setFontSize(8);
        doc.text(`Report of Boardings List`, 20, 20)
        doc.text(`Date: ${new Date().toDateString()}`, 20, 24)
        doc.text(`Author: ${userInfo.firstName} ${userInfo.lastName}`, 20, 28)
    
        doc.save("Boardings.pdf");
    
    };

    return (
        <>
            <Row>
                <Col>
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', mb:'10px', display: 'flex', alignItems: 'center', width: 400 }}
                    >
                        <InputBase
                            sx={{ ml: 1, pl:'10px', flex: 1 }}
                            placeholder="Search Boardings"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={loadData}>
                            <Search />
                        </IconButton>
                    </Paper>
                </Col>
                <Col style={{textAlign:'right'}}>
                    <MuiButton variant="contained" onClick={exportToPDF}>Export</MuiButton>
                </Col>
            </Row>
            <Row style={{marginBottom:'10px', marginTop: '10px'}}>
                <Col>
                    <TextField id="outlined-basic" variant="outlined" value={'Filter By:'} disabled/>
                </Col>
                <Col>
                    <FormControl fullWidth>
                        <InputLabel>Boarding Type</InputLabel>
                        <Select
                            value={boardingType}
                            label="Boarding Type"
                            onChange={(e) => setBoardingType(e.target.value)}
                        >
                            <MenuItem value={'Annex'}>Annex</MenuItem>
                            <MenuItem value={'Hostel'}>Hostel</MenuItem>
                        </Select>
                    </FormControl>
                </Col>
                <Col>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value={'All'}>All</MenuItem>
                            <MenuItem value={'Approved'}>Approved</MenuItem>
                            <MenuItem value={'PendingApproval'}>Pending Approval</MenuItem>
                        </Select>
                    </FormControl>
                </Col>
                <Col>
                    <FormControl fullWidth>
                        <InputLabel>No Of Rooms</InputLabel>
                        <Select
                            value={noOfRooms}
                            label="No Of Rooms"
                            onChange={(e) => setNoOfRooms(e.target.value)}
                        >
                            <MenuItem value={0}>Any</MenuItem>
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                            <MenuItem value={3}>3</MenuItem>
                            <MenuItem value={4}>4</MenuItem>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={6}>6</MenuItem>
                            <MenuItem value={7}>7</MenuItem>
                            <MenuItem value={8}>8</MenuItem>
                            <MenuItem value={9}>9</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={11}>10+</MenuItem>
                        </Select>
                    </FormControl>
                </Col>
                <Col>
                    <FormControl fullWidth>
                        <InputLabel>Gender</InputLabel>
                        <Select
                            value={gender}
                            label="Gender"
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <MenuItem value={'All'}>All</MenuItem>
                            <MenuItem value={'Male'}>Male</MenuItem>
                            <MenuItem value={'Female'}>Female</MenuItem>
                        </Select>
                    </FormControl>
                </Col>
                {boardingType=='Annex' ? 
                <Col>
                    <FormControl fullWidth>
                        <InputLabel>Rent</InputLabel>
                        <Select
                            value={rent}
                            label="Rent"
                            onChange={(e) => setRent(e.target.value)}
                        >
                            <MenuItem value={'All'}>All</MenuItem>
                            <MenuItem value={'Range'}>{rentRange[0]} - {rentRange[1]}</MenuItem>
                            <Box
                            style={{width:'225px', margin:'10px 25px'}}>
                                <Slider
                                    value={rentRange}
                                    onChange={(e,v) => {setRentRange(v),setRent('Range')}}
                                    valueLabelDisplay="auto"
                                    max={70000}
                                    min={5000}
                                    step={1000}
                                />
                            </Box>
                        </Select>
                    </FormControl>
                </Col>
                : ""}
                <Col>
                    <FormControl fullWidth>
                        <InputLabel>Date</InputLabel>
                        <Select
                            label="Date"
                            value={date}
                            onChange={handleDateChange}
                        >
                            <MenuItem value={'All'} style={{marginBottom:'10px'}}>All Time</MenuItem>
                            <MenuItem value={'range'} hidden>{startDate.toLocaleDateString('en-US')} - {endDate.toLocaleDateString('en-US')}</MenuItem>
                            <DateRange
                                ranges={[selectionRange]}
                                onChange={handleDateRangeSelect}
                                maxDate={new Date()}
                            />
                        </Select>
                    </FormControl>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover responsive style={{textWrap:'nowrap'}}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('boardingName')}>Boarding Name {sortBy=="boardingName" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('boardingType')}>Boarding Type {sortBy=="boardingType" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('city')}>City {sortBy=="city" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('status')}>Status {sortBy=="status" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('food')}>Food {sortBy=="food" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('utilityBills')}>Utility Bills {sortBy=="utilityBills" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('noOfRooms')}>No Of Rooms {sortBy=="noOfRooms" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('gender')}>Gender {sortBy=="gender" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                {boardingType === 'Annex' ? <th style={{cursor:'pointer'}} onClick={() => handleSortClick('rent')}>Rent {sortBy=="rent" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th> : ''}
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('createdAt')}>Date {sortBy=="createdAt" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <tr style={{width:'100%',height:'100%',textAlign: 'center'}}><td colSpan={11}><CircularProgress /></td></tr> : 
                                boardings.length > 0 ?
                                    boardings.map((boarding, index) => (
                                        
                                                <tr key={index}>
                                                    <td>{index+1}</td>
                                                    <td>{boarding.boardingName}</td>
                                                    <td>{boarding.boardingType}</td>
                                                    <td>{boarding.city}</td>
                                                    <td>{boarding.status}</td>
                                                    <td>{boarding.food ? "Yes" : "No"}</td>
                                                    <td>{boarding.utilityBills ? "Yes" : "No"}</td>
                                                    <td>{boarding.boardingType=='Annex' ? boarding.noOfRooms : boarding.room.length}</td>
                                                    <td>{boarding.gender}</td>
                                                    {boardingType === 'Annex' ? 
                                                    <td>
                                                        {boarding.rent}
                                                    </td>
                                                    : ''}
                                                    <td>{new Date(boarding.createdAt).toLocaleDateString('en-GB')}</td>
                                                </tr>
                                            
                                    ))
                                :
                                    <tr style={{width:'100%',height:'100%',textAlign: 'center', color:'dimgrey'}}>
                                        <td colSpan={11}></td>
                                    </tr>
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            {totalRows <= 1 ? <></> : 
            <Row>
                <Col className="mt-3">
                    <TablePagination
                        component="div"
                        count={totalRows}
                        page={page}
                        onPageChange={(pg) => setPage(pg)}
                        rowsPerPage={pageSize}
                        onRowsPerPageChange={(e) => { 
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Col>
            </Row>
            }
            <Dialog
                fullScreen={fullScreen}
                open={confirmDialog}
                onClose={handleDialogClose}
                aria-labelledby="responsive-dialog-title"
                style={{padding:'15px'}}
            >
                <DialogContent className={ownerStyles.confirmIcon}>
                    <Warning style={{fontSize:'100px'}} />
                </DialogContent>
                <DialogTitle id="responsive-dialog-title">
                    {"Are you sure you want to delete this boarding?"}
                </DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={handleDialogClose}>
                        Cancel
                    </Button>
                    <Button onClick={'deleteBoarding'} autoFocus variant="danger">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </> 
    )
};

export default AdminAllBoardings;