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
    width: '29%',
    borderRadius: '20px',
    padding: '6px',
    paddingLeft: '18px',
    border: '2px rgb(176 176 177) solid'
  }

  const { userInfo } = useSelector((state) => state.auth);

  const [getReservation] = useGetBoardingReservationsMutation();
  const [getBording] = useGetBoardingBybIdMutation();

  const [reservations, setReservations] = useState([]);
  const [boardingId , setBoardingId] = useState([]);

  const loadData = async () => {
    try {
      const res = await getReservation({ boardingId: bId }).unwrap();
      const resbor = await getBording({ bId:bId })
      setReservations(res);
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
      <div style={{ marginTop: '17px' }}>
        <input id="outlined-search" type="search" placeholder="Search occupant name..." style={searchStyle} onChange={(e) => setWord(e.target.value)} />

        <IconButton>
          <SearchIcon />
        </IconButton>
      </div>

      <TableContainer component={Paper} style={{ marginTop: "30px" }}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead style={{ backgroundColor: "#242745" }}>
            <TableRow>
              <TableCell style={{ color: "#ffffff" }}>Reservation ID</TableCell>
              <TableCell align="right" style={{ color: "#ffffff" }}>Name</TableCell>
              <TableCell align="right" style={{ color: "#ffffff" }}>Date</TableCell>
              <TableCell align="right" style={{ color: "#ffffff" }}>Duration</TableCell>
              {console.log(boardingId.boardingType)}
              {boardingId.boardingType === 'Hostel'? (
                <TableCell align="right" style={{ color: "#ffffff" }}>Room Number</TableCell>
              ):(<></>)}
              
            </TableRow>
          </TableHead>
          <TableBody style={{ backgroundColor: '#858bc72b' }}>

            {reservations.length > 0 ? (
              <>
                {reservations.map((reservation) => (
                  <TableRow
                    key={reservation.Id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {reservation.Id}
                    </TableCell>

                    <TableCell align="right">{reservation.Name}</TableCell>
                    <TableCell align="right">{new Date(reservation.Date).toDateString()}</TableCell>
                    <TableCell align="right">{reservation.Duration}</TableCell>
                    {reservation.bType === 'Hostel'?(
                    <TableCell align="right">{reservation.RoomNo}</TableCell>
                    ):(<></>)}

                  </TableRow>
                ))
                }</>) : (<>
                  <TableRow>
                    <TableCell align="right">   </TableCell>
                    <TableCell align="right">   </TableCell>
                    <TableCell style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No Reservations to display</TableCell>
                    <TableCell align="right">   </TableCell>
                    <TableCell align="right">   </TableCell>
                  </TableRow>

                </>)}

          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default ViewAllReservations;