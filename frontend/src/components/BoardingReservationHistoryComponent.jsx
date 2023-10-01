import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from "react";

import { useBoardingHistoryMutation } from '../slices/reservationHistoryApiSlice';


const BoardingReservationHistory = ({ bId }) => {

    const [getBoardingHistory] = useBoardingHistoryMutation();

    const [reservationHis, setReservationHis] = useState([]);


    const loadData = async () => {
        try {

            const resBoardingHis = await getBoardingHistory({ boardingId:bId }).unwrap();

            if (resBoardingHis) {
                setReservationHis(resBoardingHis);
            }

        } catch (error) {
            console.log(error);
        }

    }


    useEffect(() => {
        loadData();
    }, [bId]);


    return (
        <>
            <TableContainer component={Paper} style={{marginTop: "30px"}}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead style={{backgroundColor: "#242745"}}>
                        <TableRow>
                            <TableCell style={{color: "#ffffff"}}>First Name</TableCell>
                            <TableCell align="right" style={{color: "#ffffff"}}>Second Name</TableCell>
                            <TableCell align="right" style={{color: "#ffffff"}}>Email</TableCell>
                            <TableCell align="right" style={{color: "#ffffff"}}>Phone Number</TableCell>
                            <TableCell align="right" style={{color: "#ffffff"}}>Gender</TableCell>
                            <TableCell align="right" style={{color: "#ffffff"}}>Room No</TableCell>
                            <TableCell align="right" style={{color: "#ffffff"}}>Reserved Date</TableCell>
                            <TableCell align="right" style={{color: "#ffffff"}}>Cancelled Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody style={{backgroundColor:'#858bc72b'}}>

                        {reservationHis.length > 0 ? (
                            <>
                                {reservationHis.map((his) => (
                                    <TableRow
                                        key={his.Id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {his.firstName}
                                        </TableCell>
                                        
                                        <TableCell align="right">{his.lastName}</TableCell>
                                        <TableCell align="right">{his.occEmail}</TableCell>
                                        <TableCell align="right">{his.phoneNo}</TableCell>
                                        <TableCell align="right">{his.gender}</TableCell>
                                        <TableCell align="right">{his.roomNo}</TableCell>
                                        <TableCell align="right">{new Date(his.reservedDate).toDateString()}</TableCell>
                                        <TableCell align="right">{new Date(his.cancelledDate).toDateString()}</TableCell>
                                        
                                    </TableRow>
                                ))
                                }</>) : (<>
                                <TableRow>
                                <TableCell align="right">   </TableCell>
                                <TableCell align="right">   </TableCell>
                                <TableCell align="right">   </TableCell>
                                <TableCell align="right" style={{fontSize:'20px', fontFamily:'cursive', color:'#64651d'}}>No data to display</TableCell>
                                <TableCell align="right">   </TableCell>
                                <TableCell align="right">   </TableCell>
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

export default BoardingReservationHistory;