import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, Table, Container} from 'react-bootstrap';
import { Card, CardContent, Pagination, CircularProgress, Box, Collapse, IconButton, Alert, Switch, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, TablePagination, Paper, InputBase, TextField, FormControl, InputLabel, Select, MenuItem, Slider, Button as MuiButton } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Close, Search, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllBoardingsMutation, useGetAllPublicBoardingsMutation } from '../slices/boardingsApiSlice';
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

import searchStyles from '../styles/searchStyles.module.css';

import defaultImage from '/images/defaultImage.png';
import Header from "../components/header";

const SearchPage = () => {

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
    const [boardingType, setBoardingType] = useState('Annex')
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
    
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();

    const [getAllPublicBoardings, { isLoading }] = useGetAllPublicBoardingsMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
        try {
            const res = await getAllPublicBoardings( {page, pageSize, status, food, utilityBills, noOfRooms, boardingType, gender, rentRange, rent, startDate, endDate, date, search, sortBy, order} ).unwrap();

            setTotalRows(res.totalRows)
            setBoardings(res.boardings)
            setLoading(false)
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

    const handleSortClick = (column) => {
        if (sortBy === column) {
            setOrder(order === 1 ? -1 : 1);
        } else {
            setSortBy(column);
            setOrder(1);
        }
    }

    return (
        <>
            <div className={searchStyles.mainDiv}>
                <Header />
                <Container className={searchStyles.container}>
                    <Row>
                        <Col>
                            <Paper
                                component="form"
                                sx={{ p: '2px 4px', mb:'10px', mt:'20px', display: 'flex', alignItems: 'center', width: 400 }}
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
                    <Row>
                        <Col>
                        {loading ? <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> : 
                        boardings.length > 0 ? 
                            boardings.map((boarding, index) => (
                                <Link key={index} to={`/search/boardings/${boarding._id}`} style={{textDecoration:'none'}}> 
                                    <Card className={`${searchStyles.card} mt-4`}>
                                        <CardContent className={searchStyles.cardContent}>
                                            <Row style={{height:'100%', width:'100%'}}>
                                                <Col style={{height:'100%'}} lg={4}>
                                                    <Image src={boarding.boardingImages[0] ?  boarding.boardingImages[0]: defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={searchStyles.images}height='100%' width='100%'/>
                                                </Col>
                                                <Col lg={8}>
                                                    <Row>
                                                        <Col>
                                                            <h2>{boarding.boardingName.toUpperCase()}</h2>
                                                            <p style={{color: 'dimgray'}}>{boarding.city}, {boarding.boardingType}</p>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <p className={searchStyles.paras}><b>Address:</b> {boarding.address}</p>
                                                            <p className={searchStyles.paras}><b>Rooms:</b> {boarding.boardingType=='Annex' ? boarding.noOfRooms : boarding.room.length}</p>
                                                            {boarding.boardingType=='Annex' ? 
                                                                <p className={searchStyles.paras}><b>Baths:</b> {parseInt(boarding.noOfCommonBaths)+parseInt(boarding.noOfAttachBaths)}</p> 
                                                            : ''}
                                                            <p className={searchStyles.paras}><b>Gender:</b> {boarding.gender}</p>
                                                        </Col>
                                                        <Col>
                                                            <p className={searchStyles.paras}><b>Utility Bills:</b> {boarding.utilityBills ? 'Yes' : 'No'}</p>
                                                            <p className={searchStyles.paras}><b>Food:</b> {boarding.food ? 'Yes' : 'No'}</p>
                                                            {boarding.facilities.length > 0 ?
                                                            <>
                                                                <p className={searchStyles.paras} style={{marginBottom:0}}><b>Facilities</b></p>
                                                                <ul style={{paddingLeft:'0.5em'}}>
                                                                    {boarding.facilities.map((facility,index) => (
                                                                    <li key={index} style={{color:'dimgray', listStyleType:'none'}} className={searchStyles.facilities}>{facility}</li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                            :''}
                                                        </Col>
                                                        <Col>
                                                        {boarding.boardingType == 'Annex' ? 
                                                            <p className={searchStyles.paras}><b>Rent:</b> Rs {boarding.rent} /Month</p>
                                                        :''}
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        :
                            <div style={{height:'100%', width:'100%',display:'flex',justifyContent:'center',alignItems:'center', color:'dimgrey', minHeight:'70vh'}}>
                                <h2>No Boardings Found!</h2>
                            </div>
                        }
                        </Col>
                    </Row>
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
                </Container>
            </div>
        </> 
    )
};

export default SearchPage;