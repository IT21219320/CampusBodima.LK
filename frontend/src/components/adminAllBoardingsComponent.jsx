import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, Table} from 'react-bootstrap';
import { Card, CardContent, Pagination, CircularProgress, Box, Collapse, IconButton, Alert, Switch, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, TablePagination, Paper, InputBase, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Close, Search, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllBoardingsMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import LoadingButton from '@mui/lab/LoadingButton';
import storage from "../utils/firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";

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
    const [startRent, setStartRent] = useState(0)
    const [endRent, setEndRent] = useState(0)
    const [rent, setRent] = useState('All')
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [date, setDate] = useState('All')
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [order, setOrder] = useState(1)
    const [confirmDialog, setConfirmDialog] = useState(false);


    
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();

    const [getAllBoardings, { isLoading }] = useGetAllBoardingsMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
        try {
            const res = await getAllBoardings( {page, pageSize, status, food, utilityBills, noOfRooms, boardingType, gender, startRent, endRent, rent, startDate, endDate, date, search, sortBy, order} ).unwrap();

            setTotalRows(res.totalRows)
            setBoardings(res.boardings)
            console.log(res.boardings);
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

    },[page, pageSize, status, food, utilityBills, noOfRooms, boardingType, gender, startRent, endRent, rent, startDate, endDate, date, search, sortBy, order]);

    const handleDialogOpen = (e, id) => {
        e.preventDefault();
        setTempDeleteId(id);
        setConfirmDialog(true);
    }

    const handleDialogClose = () => {
        setTempDeleteId('');
        setConfirmDialog(false);
    }

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
            </Row>
            <Row style={{marginBottom:'10px'}}>
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
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover responsive style={{textWrap:'nowrap'}}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Boarding Name</th>
                                <th>Boarding Type</th>
                                <th>City</th>
                                <th>Status</th>
                                <th>Food</th>
                                <th>Utility Bills</th>
                                <th>No Of Rooms</th>
                                <th>Gender</th>
                                <th>Rent</th>
                                <th>Date</th>
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
                                            <td>{boarding.rent}</td>
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