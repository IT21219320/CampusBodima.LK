import * as React from 'react';
import Sidebar from '../components/sideBar';
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
import { useGetBoardingReservationsMutation } from '../slices/reservationsApiSlice';
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

const ViewAllReservationsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { bId } = useParams();

  const [getReservation] = useGetBoardingReservationsMutation();
  const [reservations, setReservations] = useState([]);

  const loadData = async () => {
    try {
      const res = await getReservation({ boardingId: bId }).unwrap();
      setReservations(res);

    } catch (error) {
      console.error('Error getting boardings', error);
    }

  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Sidebar />
      <Container>
        <Row >

          <Col>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
              <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
              <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
              <Link underline="hover" key="3" color="inherit" href="/owner/reservations">Reservations</Link>,
              <Typography key="4" color="text.primary">All Reservations</Typography>
            </Breadcrumbs>
          </Col>

        </Row>

        <Row>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Reservation ID</StyledTableCell>
                  <StyledTableCell align="right">Name</StyledTableCell>
                  <StyledTableCell align="right">Date</StyledTableCell>
                  <StyledTableCell align="right">Duration</StyledTableCell>
                  <StyledTableCell align="right">RoomNo</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <StyledTableRow key={reservation.Id}>
                      <StyledTableCell component="th" scope="row">
                        {reservation.Id}
                      </StyledTableCell>
                      <StyledTableCell align="right">{reservation.Name}</StyledTableCell>
                      <StyledTableCell align="right">{reservation.Date}</StyledTableCell>
                      <StyledTableCell align="right">{reservation.Duration}</StyledTableCell>
                      <StyledTableCell align="right">{reservation.RoomNo}</StyledTableCell>
                    </StyledTableRow>
                  ))) : (
                  <StyledTableRow >
                    <StyledTableCell component="th" scope="row">
                      No data
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Row>
      </Container>
    </>
  )
}

export default ViewAllReservationsPage;