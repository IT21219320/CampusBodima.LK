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
import {
  useGetPendingReservationsMutation,
  useApprovePendingStatusMutation,
  useDeletePendingStatusMutation,
  useGetBoardingBybIdMutation
} from '../slices/reservationsApiSlice';


const PendingReservations = ({ bId }) => {

  const { userInfo } = useSelector((state) => state.auth);

  const [getPending] = useGetPendingReservationsMutation();
  const [approvePending] = useApprovePendingStatusMutation();
  const [deletePending] = useDeletePendingStatusMutation();
  const [getBoarding] = useGetBoardingBybIdMutation();

  const [pendings, setPendings] = useState([]);
  const [delPending, setDelPending] = useState('');
  const [ApprPending, setApprPending] = useState('');
  const [boardingID, setBoardingId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await getPending({ boardingId: bId }).unwrap();
      const resbor = await getBoarding({ bId: bId }).unwrap();
      setPendings(res);

      console.log(resbor.selectedBoarding.boardingType)
      setBoardingId(resbor.selectedBoarding.boardingType);
      setLoading(false)

    } catch (error) {
      console.error('Error getting pending', error);
    }

  }

  useEffect(() => {
    loadData();
  }, [bId, delPending, ApprPending]);

  const handleDelete = async (reservationID) => {
    try {
      setLoading(true)
      const resDelete = await deletePending({ reservationId: reservationID }).unwrap();
      console.log(resDelete)
      setDelPending(resDelete);
      console.log(reservationID)
      setPendings((prevCards) => prevCards.filter((pending) => pending.Id !== reservationID));
      setLoading(false)
      setLoading(false)
    } catch (error) {
      console.error('Error in deleting', error);
    }
  }

  const handleUpdate = async (reservationID) => {
    try {
      setLoading(true)
      const resUpdate = await approvePending({ reservationId: reservationID }).unwrap();
      console.log(resUpdate)
      setApprPending(resUpdate);
      console.log(reservationID)
      setPendings((prevCards) => prevCards.filter((pending) => pending.Id !== reservationID));
      setLoading(false)
    } catch (error) {
      console.error('Error in updating', error);
    }
  }



  return (
    <>
      {loading ? (
        <>
          <div style={{ width: '100%', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </div>
        </>) : (
        <>
          <Container>

            <div className="bla">

            </div>
            <TableContainer component={Paper} style={{ marginTop: "30px" }}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">

                <TableHead style={{ backgroundColor: "#242745" }}>
                  <TableRow >

                    <TableCell style={{ color: "#ffffff" }}>Reservation ID</TableCell>
                    <TableCell style={{ color: "#ffffff" }}>First Name</TableCell>
                    <TableCell style={{ color: "#ffffff" }}>Reserved Date</TableCell>
                    <TableCell style={{ color: "#ffffff" }}>Duration</TableCell>
                    {boardingID === 'Hostel' && (<>
                      <TableCell align="right" style={{ color: "#ffffff" }}>Room Number</TableCell></>)}

                    <TableCell style={{ color: "#ffffff" }}>Approve</TableCell>
                    <TableCell style={{ color: "#ffffff" }} align="left">Delete</TableCell>

                  </TableRow>
                </TableHead>

                <TableBody style={{ backgroundColor: '#858bc72b' }}>
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
                        <TableCell align="left">{new Date(pending.Date).toDateString()}</TableCell>
                        <TableCell align="left">{pending.Duration}</TableCell>
                        {pending.bType === 'Hostel' &&
                          (<><TableCell align="left">{pending.RoomNo}</TableCell></>)
                        }

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
                      <TableRow style={{ backgroundColor: 'rgb(248 247 250)' }}>
                        <TableCell align="left">   </TableCell>
                        <TableCell align="left">   </TableCell>
                        <TableCell align="right" style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No pendig resrevations to display</TableCell>
                        <TableCell align="left">   </TableCell>
                        <TableCell align="left">   </TableCell>
                        <TableCell align="left">   </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </>)}
    </>
  );
};

export default PendingReservations;