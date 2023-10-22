import * as React from 'react';
import Sidebar from './sideBar';
import { Breadcrumbs, Typography, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Container, Row, Col, } from 'react-bootstrap';
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import { GridViewRounded, GetAppRounded } from '@mui/icons-material';
import { useGetBoardingReservationsMutation } from '../slices/reservationsApiSlice';
import { useGetBoardingBybIdMutation } from '../slices/reservationsApiSlice';
import { useParams } from 'react-router-dom';

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

const ViewAllReservations = ({ bId }) => {

  const searchStyle = {
    width: '55%',
    borderRadius: '20px',
    padding: '6px',
    paddingLeft: '18px',
    border: '2px rgb(176 176 177) solid'
  }

  const { userInfo } = useSelector((state) => state.auth);

  const [getReservation] = useGetBoardingReservationsMutation();
  const [getBording] = useGetBoardingBybIdMutation();

  const [reservations, setReservations] = useState([]);
  const [boardingId, setBoardingId] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(true);


  const handleSearch = (e) => {
    setSearchWord(e.target.value);
  }

  const filteredReservations = reservations.filter(reservation => {
    return reservation.firstName.toLowerCase().includes(searchWord.toLowerCase()) ||
      reservation.lastName.toLowerCase().includes(searchWord.toLowerCase());
  });


  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  //function implementation of getting the month and returning sorted data
  const sortReservationsByREservedMonth = (reservations, selectedMonth) => {
    return reservations.filter(reservation => {
      const reservedDate = new Date(reservation.Date);
      const reservedMonth = reservedDate.toLocaleString('default', { month: 'short' });
      if (selectedMonth === "") {
        return reservedMonth
      } else {
        return reservedMonth === selectedMonth
      };
    });
  }

  //calling the function
  const sortedReservationsByMonth = sortReservationsByREservedMonth(filteredReservations, month);


  const loadData = async () => {

    try {
      setLoading(true)

      const res = await getReservation({ boardingId: bId }).unwrap();
      setReservations(res);

      setLoading(false)

    } catch (error) {
      setLoading(false)
      console.error('Error getting reservations', error);
    }

    try {
      const resbor = await getBording({ bId: bId });

      setBoardingId(resbor.data.selectedBoarding);
      console.log(resbor.data.selectedBoarding);
    } catch (error) {

      console.error('Error getting boardings', error);

    }

  }

  useEffect(() => {
    loadData();
  }, [bId]);

  return (
    <>
      <Row>

        <Col>

          <div style={{ marginTop: '17px' }}>
            <input id="outlined-search"
              type="search"
              placeholder="Search occupant name..."
              style={searchStyle}
              value={searchWord}
              onChange={handleSearch}
            />

            <IconButton>
              <SearchIcon />
            </IconButton>
          </div>

        </Col>

        <Col>
          <div style={{ width: '130px', float: 'left', marginTop: '17px', marginLeft: '200px' }}>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth size='small'>
                <InputLabel id="demo-simple-select-label">Month</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={month}
                  label="Month"
                  onChange={handleMonthChange}
                >
                  <MenuItem value="" >All</MenuItem>
                  <MenuItem value="Jan">January</MenuItem>
                  <MenuItem value="Feb">February</MenuItem>
                  <MenuItem value="Mar">March</MenuItem>
                  <MenuItem value="Apr">April</MenuItem>
                  <MenuItem value="May">May</MenuItem>
                  <MenuItem value="Jun">June</MenuItem>
                  <MenuItem value="Jul">July</MenuItem>
                  <MenuItem value="Aug">August</MenuItem>
                  <MenuItem value="Sep">September</MenuItem>
                  <MenuItem value="Oct">October</MenuItem>
                  <MenuItem value="Nov">November</MenuItem>
                  <MenuItem value="Dec">December</MenuItem>

                </Select>
              </FormControl>
            </Box>
          </div>

          <div>
            <Button variant="contained" style={{ background: '#4c4c4cb5', float: 'right', marginTop: '17px' }} /*onClick={exportToPDF} */>Export<GetAppRounded /></Button>
          </div>

        </Col>
      </Row>

      {loading ? (
        <>
          <div style={{ width: '100%', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </div>
        </>) : (
        <>
          <TableContainer component={Paper} style={{ marginTop: "30px" }}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
              <TableHead style={{ backgroundColor: "#242745" }}>
                <TableRow>
                  <TableCell style={{ color: "#ffffff" }}>Reservation ID</TableCell>
                  <TableCell align="right" style={{ color: "#ffffff" }}>First Name</TableCell>
                  <TableCell align="right" style={{ color: "#ffffff" }}>Second Name</TableCell>
                  <TableCell align="right" style={{ color: "#ffffff" }}>Email</TableCell>
                  <TableCell align="right" style={{ color: "#ffffff" }}>Date</TableCell>
                  <TableCell align="right" style={{ color: "#ffffff" }}>Duration</TableCell>
                  {console.log(boardingId.boardingType)}
                  {boardingId.boardingType === 'Hostel' ? (
                    <TableCell align="right" style={{ color: "#ffffff" }}>Room Number</TableCell>
                  ) : (
                    <>
                      <TableCell align="right" style={{ color: "#ffffff" }}>Duration</TableCell>
                    </>)}

                </TableRow>
              </TableHead>
              <TableBody style={{ backgroundColor: '#858bc72b' }}>

                {reservations.length > 0 ? (
                  <>
                    {filteredReservations.length > 0 ? (

                      <>
                        {sortedReservationsByMonth.length > 0 ? (
                          <>
                            {sortedReservationsByMonth.map((reservation) => (
                              <TableRow
                                key={reservation.Id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                                <TableCell component="th" scope="row">
                                  {reservation.Id}
                                </TableCell>

                                <TableCell align="right">{reservation.firstName}</TableCell>
                                <TableCell align="right">{reservation.lastName}</TableCell>
                                <TableCell align="right">{reservation.email}</TableCell>
                                <TableCell align="right">{new Date(reservation.Date).toDateString()}</TableCell>
                                <TableCell align="right">{reservation.Duration}</TableCell>
                                {reservation.bType === 'Hostel' && (
                                  <TableCell align="right">{reservation.RoomNo}</TableCell>
                                )}

                              </TableRow>
                            ))
                            }

                          </>) : (
                          <>
                            <TableRow>
                              <TableCell align="right">   </TableCell>
                              <TableCell align="right">   </TableCell>
                              <TableCell align="right">   </TableCell>
                              <TableCell style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No Reservations to display</TableCell>
                              <TableCell align="right">   </TableCell>
                              <TableCell align="right">   </TableCell>
                              <TableCell align="right">   </TableCell>

                            </TableRow>

                          </>)}
                      </>) : (
                      <>
                        <TableRow style={{ color: 'rgb(255, 255, 255)' }}>
                          <TableCell align="right">   </TableCell>
                          <TableCell align="right">   </TableCell>
                          <TableCell align="right">   </TableCell>
                          <TableCell style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No Reservations to display</TableCell>
                          <TableCell align="right">   </TableCell>
                          <TableCell align="right">   </TableCell>
                          <TableCell align="right">   </TableCell>

                        </TableRow>
                      </>)}
                  </>) :
                  (<>
                    <TableRow>
                      <TableCell align="right">   </TableCell>
                      <TableCell align="right">   </TableCell>
                      <TableCell align="right">   </TableCell>
                      <TableCell style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No Reservations to display</TableCell>
                      <TableCell align="right">   </TableCell>
                      <TableCell align="right">   </TableCell>
                      <TableCell align="right">   </TableCell>

                    </TableRow>

                  </>)}

              </TableBody>
            </Table>
          </TableContainer>
        </>)}

    </>
  )
}

export default ViewAllReservations;