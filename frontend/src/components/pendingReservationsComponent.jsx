import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Sidebar from './sideBar';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from "react"
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { Container, Row, Col, } from 'react-bootstrap';
import { Breadcrumbs, Typography, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useGetPendingReservationsMutation, useApprovePendingStatusMutation, useDeletePendingStatusMutation } from '../slices/reservationsApiSlice';


const PendingReservations = ({bId}) => {

  const { userInfo } = useSelector((state) => state.auth);

  const [getPending] = useGetPendingReservationsMutation();
  const [approvePending] = useApprovePendingStatusMutation();
  const [deletePending] = useDeletePendingStatusMutation();

  const [pendings, setPendings] = useState([]);
  const [delPending, setDelPending] = useState('');
  const [ApprPending, setApprPending] = useState('');

  const loadData = async () => {
    try {
      const res = await getPending({ boardingId: bId }).unwrap();
      setPendings(res);
      
    } catch (error) {
      console.error('Error getting pending', error);
    }

  }

  useEffect(() => {
    loadData();
  }, [bId,delPending,ApprPending]);

  const handleDelete = async (reservationID) => {
    try {
      const resDelete = await deletePending({ reservationId: reservationID }).unwrap();
      console.log(resDelete)
      setDelPending(resDelete);
      console.log(reservationID)
      setPendings((prevCards) => prevCards.filter((pending) => pending.Id !== reservationID));
    } catch (error) {
      console.error('Error in deleting', error);
    }
  }
  
  const handleUpdate = async (reservationID) => {
    try {
      const resUpdate = await approvePending({ reservationId: reservationID }).unwrap();
      console.log(resUpdate)
      setApprPending(resUpdate);
      console.log(reservationID)
      setPendings((prevCards) => prevCards.filter((pending) => pending.Id !== reservationID));
    } catch (error) {
      console.error('Error in updating', error);
    }
  }



  return (
    <>
      <Container>

        <div className="bla">

        </div>
        <TableContainer component={Paper} style={{marginTop: "30px"}}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">

            <TableHead style={{backgroundColor: "#242745"}}>
              <TableRow >

                <TableCell style={{color: "#ffffff"}}>Reservation ID</TableCell>
                <TableCell style={{color: "#ffffff"}}>First Name</TableCell>
                <TableCell style={{color: "#ffffff"}}>Reserved Date</TableCell>
                <TableCell style={{color: "#ffffff"}}>Duration</TableCell>
                <TableCell style={{color: "#ffffff"}}>Room No</TableCell>
                <TableCell style={{color: "#ffffff"}}>Approve</TableCell>
                <TableCell style={{color: "#ffffff"}}align="left">Delete</TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {pendings.length > 0 ? (

                pendings.map((pending) => (
                  <TableRow
                    key={pending.Id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {pending.Id}
                    </TableCell>
                    <TableCell align="left">{pending.Name}</TableCell>
                    <TableCell align="left">{pending.Date}</TableCell>
                    <TableCell align="left">{pending.Duration}</TableCell>
                    <TableCell align="left">{pending.RoomNo}</TableCell>


                    <TableCell align="left">
                      <Button variant="outlined" size="small" onClick={() => handleUpdate(pending.Id)} style={{ color: '#44a97a', borderColor: '#44a97a' }}>
                        Approve
                      </Button>
                    </TableCell>
                    <TableCell align="left">
                      <Button variant="outlined" size="small" onClick={() => handleDelete(pending.Id)} style={{ color: '#ff0000', borderColor: '#ff0000' }}>
                        Delete
                      </Button>
                    </TableCell>

                  </TableRow>
                )

                )) : (
                <>
                  <TableRow>

                    <TableCell align="right">No pendig resrevations to display</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
};

export default PendingReservations;