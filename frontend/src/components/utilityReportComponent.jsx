import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, Table} from 'react-bootstrap';
import { Card, CardContent, Pagination, CircularProgress, Box, Collapse, IconButton, Alert, Switch, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, TablePagination, Paper, InputBase, TextField, FormControl, InputLabel, Select, MenuItem, Slider, Button as MuiButton } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Close, Padding, Search, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetUtilityReportMutation } from '../slices/utilitiesApiSlice';
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

const utilityReport = ({ boardingId ,occupant}) => {

    const [noticeStatus, setNoticeStatus] = useState(true);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10)
    const [totalRows, setTotalRows] = useState(0);
    const [Utilities, setUtilities] = useState([]);
    const [UtilityType, setUtilityType] = useState('Electricity')
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [date, setDate] = useState('All')
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [order, setOrder] = useState(1)
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [boardingNames, setBoardingNames] = useState([]);
     

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();

    const [getAllUtility, { isLoading }] = useGetUtilityReportMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
      try {
          const res = await getAllUtility( {boardingId,occupant,page, pageSize, UtilityType, startDate, endDate, date, search, sortBy, order} ).unwrap();
          setTotalRows(res.totalRows)
          setUtilities(res.utility)
      } catch (err) {
          toast.error(err.data?.message || err.error);
          setLoading(false);
      }
   }

   useEffect(() => {
        
    loadData(); 
    console.log(Utilities);

    if(totalRows < pageSize){
        setPage(0);
    }    

   },[boardingId,occupant,page, pageSize, UtilityType, startDate, endDate, date, search, sortBy, order]);

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
 
  

  const exportToPDF = () => {
                
    const doc = new jsPDF();
    
    // company details
    const companyDetails = {
        name: "CampusBodima",
        address: "138/K, Ihala Yagoda, Gampaha",
        phone: "071-588-6675",
        email: "info.campusbodima@gmail.com",
        website: "www.campusbodima.com"
    };

    // logo
    doc.addImage("/logo2.png", "PNG", 10, 10, 50, 30);

    // Show company details
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(`${companyDetails.name}`, 200, 20, { align: "right", style: "bold" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${companyDetails.address}`, 200, 25, { align: "right" });
    doc.text(`${companyDetails.phone}`, 200, 29, { align: "right" });
    doc.text(`${companyDetails.email}`, 200, 33, { align: "right" });
    doc.text(`${companyDetails.website}`, 200, 37, { align: "right" });

    // horizontal line
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);

    // Report details
    doc.setFontSize(8);
    doc.text(`Report of Utility`, 20, 55);
    doc.text(`Date: ${new Date().toDateString()}`, 20, 59);
    doc.text(`Author: ${userInfo.firstName} ${userInfo.lastName}`, 20, 63);
    const boardingName= Utilities[0].boarding.boardingName
    doc.text(`${boardingName} `, 20, 67);

    // Add report title
    doc.setFontSize(12);
    doc.text(`${UtilityType} List of `, 85, 65);


    // Define the table headers
     let headers = ["Utility Type", "Amount","Month","Occupants","Per Cost","Description", "Date"];

    // Map IngredientHistory data to table rows
         const data = Utilities.map((Utility) => [
            Utility.utilityType,
            Utility.amount,
            Utility.month,
            Utility.occupant.map((occupant) => occupant.firstName).join(', '),
            Utility.perCost,
            Utility.description,
            formatDate(Utility.createdAt),
      ]);

      // Set the table styles
      const styles = {
        halign: "center",
        valign: "middle",
        fontSize: 9,
      };

      // Add the table to the PDF document
      doc.autoTable({
          head: [headers],
          body: data,
          styles,
          startY: 75
      });

      

      doc.save("Utility_Report.pdf");
          
  };
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = {
      year: "numeric",
      month: "long", // You can change "long" to "short" for abbreviated month names.
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }
 
  
  


  return (
     <>
    <div style={{ padding: '20px' }}>
        <Row>
                <Col>
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', mb:'10px', display: 'flex', alignItems: 'center', width: 400  }}
                    >
                        <InputBase
                            sx={{ ml: 1, pl:'10px', flex: 1 }}
                            placeholder="Search Description"
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
                    <TextField id="outlined-basic" variant="outlined" value={'Filter By:'} disabled size="small"/>
                </Col>
                <Col>
                    <FormControl fullWidth size="small">
                        <InputLabel>UtilityType</InputLabel>
                        <Select
                            value={UtilityType}
                            label="UtilityType"
                            onChange={(e) =>setUtilityType(e.target.value)}
                        >
                            <MenuItem value={'Electricity'}>Electricity</MenuItem>
                            <MenuItem value={'Water'}>Water</MenuItem>
                            <MenuItem value={'Other'}>Other</MenuItem>
                        </Select>
                    </FormControl>
                </Col>
                <Col>
                    <FormControl fullWidth size="small">
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
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('type')}>Type {sortBy=="type" ? (order==1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>
                                <th style={{cursor:'pointer'}}>Amount</th> 
                                <th style={{cursor:'pointer'}}>Month</th> 
                                <th style={{cursor:'pointer'}}>Occupants</th> 
                                <th style={{cursor:'pointer'}}>Per Cost</th> 
                                <th style={{cursor:'pointer'}}>Description</th>
                                <th style={{cursor:'pointer'}} onClick={() => handleSortClick('createdAt')}>Date {sortBy==="createdAt" ? (order===1 ? <ImSortAmountAsc /> : <ImSortAmountDesc />) : <BiSortAlt2 />}</th>

                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <tr style={{width:'100%',height:'100%',textAlign: 'center'}}><td colSpan={11}><CircularProgress /></td></tr> : 
                                Utilities.length > 0 ?
                                    Utilities.map((Utility, index) => (
                                        
                                                <tr key={index}>
                                                    <td>{index+1}</td>
                                                    <td>{Utility.utilityType}</td>
                                                    <td>{Utility.amount}</td>
                                                    <td>{Utility.month}</td>
                                                    
                                                    <td>
                                                        {Utility.occupant.map((occup, index) => (
                                                            <span key={index}>{occup.firstName}{index !== Utility.occupant.length - 1 ? ', ' : ''}</span>
                                                        ))}
                                                        {console.log('Utility.occupant:', Utility.occupant)}
                                                        </td>

                                                  

                                                    <td>{Utility.perCost}</td>
                                                    <td>{Utility.description}</td>
                                                    <td>{formatDate(Utility.createdAt)}</td>


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
            
            </div>     
     </>
  )
}

export default utilityReport