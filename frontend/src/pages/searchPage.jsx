import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, Table, Container, Form} from 'react-bootstrap';
import { Card, CardContent, Pagination, CircularProgress, Box, Collapse, IconButton, Alert, Switch, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, TablePagination, Paper, InputBase, TextField, FormControl, InputLabel, Select, MenuItem, Slider, Button as MuiButton, Autocomplete, OutlinedInput, InputAdornment, FormControlLabel, Checkbox } from "@mui/material";
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
import { formatDistanceToNow } from 'date-fns';
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
    const [boardingType, setBoardingType] = useState('Hostel')
    const [gender, setGender] = useState('All')
    const [rentRange, setRentRange] = useState([0, 70000])
    const [rent, setRent] = useState('All')
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [date, setDate] = useState('All')
    const [city, setCity] = useState('All')
    const [cities, setCities] = useState([])
    const [facilities, setFacilities] = useState([]);
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('updatedAtDesc')
    const [order, setOrder] = useState(-1)
    const [confirmDialog, setConfirmDialog] = useState(false);
    
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();

    const [getAllPublicBoardings, { isLoading }] = useGetAllPublicBoardingsMutation();
    const [getAllBoardings,] = useGetAllBoardingsMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
        try {
            setLoading(true)
            const res = await getAllPublicBoardings( {page, pageSize, status, food, utilityBills, noOfRooms, boardingType, gender, city, rentRange, rent, startDate, endDate, date, search, sortBy, order, facilities} ).unwrap();

            setTotalRows(res.totalRows)
            setBoardings(res.boardings)
            setCities(res.cities)

            const updatedBoardings = await Promise.all(res.boardings.map(async (boarding) => {
                if (boarding.boardingImages && boarding.boardingImages.length > 0) {
                    const imageRef = ref(storage, boarding.boardingImages[0]); // Reference to the first image in the boarding
                    try {
                        const imageUrl = await getDownloadURL(imageRef); // Get the download URL for the image
                        // Create a new boarding object with the updated first image URL
                        return {
                            ...boarding,
                            boardingImages: [imageUrl, ...boarding.boardingImages.slice(1)]
                        };
                    } catch (error) {
                        console.error('Error fetching image URL:', error);
                        // Handle errors if necessary
                    }
                }
                // Return the original boarding object if there are no boardingImages or an error occurred
                return boarding;
            }));
            
            setBoardings(updatedBoardings);


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

    },[page, pageSize, status, food, utilityBills, noOfRooms, boardingType, gender, city, rentRange, rent, startDate, endDate, date, search, sortBy, order, facilities]);

    const handleDialogOpen = (e, id) => {
        e.preventDefault();
        setTempDeleteId(id);
        setConfirmDialog(true);
    }

    const handleDialogClose = () => {
        setTempDeleteId('');
        setConfirmDialog(false);
    }

    const TimeAgo = ( date ) => {
        const formattedDate = formatDistanceToNow(date, { addSuffix: true });
        
        return formattedDate;
    }

    const handleFacilitySelection = (facility) => {
        if (facilities.includes(facility)) {
          setFacilities(facilities.filter((f) => f !== facility));
        } else {
          setFacilities([...facilities, facility]);
        }
    };

    const marks = [ {value: 5000, label: 'Rs. 5,000',}, {value: 10000,}, {value: 20000,}, {value: 35000,},  {value: 55000,}, {value: 70000,label: 'Rs. 70,000',},];
    const availableFacilities = ["Air Conditioning", "Washing Machine", "Hot Water", "Free Wi-Fi"];

    return (
        <>
            <div className={searchStyles.mainDiv}>
                <Header />
                <Container className={searchStyles.container}>
                    <Row>
                        <Col>
                            <Autocomplete
                                value={city}
                                onChange={(event, newValue) => {
                                    setCity(newValue? newValue : 'All');
                                }}
                                options={cities}
                                sx={{ p: '2px 4px', mb:'10px', mt:'20px', width: '100%' }}
                                renderInput={(params) => <TextField {...params} label="Location" />}
                            />
                        </Col>
                        <Col>
                            <FormControl fullWidth sx={{ p: '2px 4px', mb:'10px', mt:'20px' }}>
                                <InputLabel>Boarding Type</InputLabel>
                                <Select
                                    value={boardingType}
                                    label="Boarding Type"
                                    onChange={(e) => setBoardingType(e.target.value)}
                                >
                                    <MenuItem value={"Annex"}>Annex</MenuItem>
                                    <MenuItem value={"Hostel"}>Hostel</MenuItem>
                                </Select>
                            </FormControl>
                        </Col>
                        <Col>
                            <Paper
                                component="form"
                                sx={{ p: '6px 4px', mb:'10px', mt:'20px', display: 'flex', alignItems: 'center', width: "100%" }}
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
                    <hr />
                    <Row>
                        <Col lg={3} style={{borderRight:'1px solid #c7c8c9', paddingRight:'20px'}}>
                            <Row style={{marginBottom:'20px'}}>
                                <Col>
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Sort By</InputLabel>
                                        <Select
                                            value={sortBy}
                                            label="Sort By"
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <MenuItem value={"updatedAtDesc"}>Date: Newest on top</MenuItem>
                                            <MenuItem value={"updatedAtAsc"}>Date: Oldest on top</MenuItem>
                                            <MenuItem value={"rentDesc"}>Rent: High to Low</MenuItem>
                                            <MenuItem value={"rentAsc"}>Rent: Low to High</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Col>
                            </Row>
                            <Row style={{marginBottom:'20px'}}>
                                <Col lg={12}>Price</Col>
                                <Col>
                                    <Box style={{margin:'10px 25px'}}>
                                        <Slider
                                            value={rentRange}
                                            onChange={(e,v) => {setRentRange(v),setRent('Range')}}
                                            valueLabelDisplay="auto"
                                            max={70000}
                                            min={5000}
                                            step={1000}
                                            marks={marks}
                                        />
                                    </Box>
                                </Col>
                            </Row>
                            <Row style={{marginBottom:'20px'}}>
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
                            </Row>
                            <Row>
                                <Col style={{height:'100%'}} lg={12}>
                                    <Form.Label style={{margin:0}}>Facilities</Form.Label>
                                </Col>
                                <Col style={{height:'100%'}}>
                                    <Row style={{margin:'10px 25px'}}>
                                        {availableFacilities.map((facility) => (
                                        <Col lg={12}>
                                            <FormControlLabel
                                                key={facility}
                                                control={<Checkbox style={{paddingTop:0, paddingBottom:0}} checked={facilities.includes(facility)} onChange={() => handleFacilitySelection(facility)} />}
                                                label={facility}
                                                style={{whiteSpace:'nowrap'}}
                                            />
                                        </Col>
                                        ))}
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col style={{paddingLeft:'20px'}}>
                        {loading ? <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center', minHeight:'70vh'}}><CircularProgress /></div> : 
                        boardings.length > 0 ? 
                            boardings.map((boarding, index) => (
                                <Link key={index} to={`/search/boardings/${boarding._id}`} style={{textDecoration:'none'}}> 
                                    <Card className={`${searchStyles.card}`}>
                                        <CardContent className={searchStyles.cardContent}>
                                            <div className={searchStyles.timeAgo}>{TimeAgo(new Date(boarding.updatedAt))}</div>
                                            <Row style={{height:'100%', width:'100%'}}>
                                                <Col style={{height:'100%'}} lg={5}>
                                                    <Image src={boarding.boardingImages[0] ?  boarding.boardingImages[0]: defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={searchStyles.images}height='100%' width='100%'/>
                                                </Col>
                                                <Col lg={7}>
                                                    <Row>
                                                        <Col>
                                                            <h2>{boarding.boardingName.toUpperCase()}</h2>
                                                            <p style={{color: 'dimgray'}}>{boarding.address}</p>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <p className={searchStyles.paras}>{boarding.city}, {boarding.boardingType}</p>
                                                            <p className={searchStyles.paras}>Bedrooms: {boarding.boardingType=='Annex' ? boarding.noOfRooms : boarding.room.length}
                                                            {boarding.boardingType=='Annex' ? 
                                                                <>&nbsp;&nbsp;Bathrooms: {parseInt(boarding.noOfCommonBaths)+parseInt(boarding.noOfAttachBaths)}</>
                                                            : ''}
                                                            </p> 
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                        {boarding.boardingType == 'Annex' ? 
                                                            <p className={searchStyles.paras} style={{color: '#00b15c'}}><b>Rs {boarding.rent} /Month</b></p>
                                                        :
                                                            <p className={searchStyles.paras}>Starting from: <b style={{color: '#00b15c'}}>Rs {Math.min(...boarding.room.map(room => room.rent))} /Month</b></p>
                                                        }
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