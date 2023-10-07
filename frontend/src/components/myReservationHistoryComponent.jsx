import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useMyHistoryMutation } from '../slices/reservationHistoryApiSlice';


const MyReservationHistoryComponent = () => {

    const { userInfo } = useSelector((state) => state.auth);

    const [myHistory] = useMyHistoryMutation();

    const [myHistoryDetails, setMyHistoryDetails] = useState([]);

    const loadData = async() => {
        try {
            const res = await myHistory({occId:userInfo._id}).unwrap();
            console.log(res)
            if(res){
                setMyHistoryDetails(res);
                console.log(myHistoryDetails)
            }
        } catch (error) {
            console.error('error getting reservation history', error);
        }
    }

    useEffect(() => {
        loadData();
    }, []);



    return(
        <>
        <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Boarding Name</TableCell>
            <TableCell align="right">Boarding Type</TableCell>
            <TableCell align="right">Room No</TableCell>
            <TableCell align="right">Reserved Date</TableCell>
            <TableCell align="right">Cancelled Date</TableCell>
            <TableCell align="right">FeedBack</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            {myHistoryDetails > 0 ? (
                <>
                {myHistoryDetails.map((myHis) => (
                    <TableRow
                    key={myHis.Id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {myHis.BoardingName}
                    </TableCell>
                    <TableCell align="right">{myHis.BoardingType}</TableCell>
                    <TableCell align="right">{myHis.RoomNo}</TableCell>
                    <TableCell align="right">{myHis.reservedDate}</TableCell>
                    <TableCell align="right">{myHis.cancelledDate}</TableCell>
                    <TableCell align="right">{myHis.cancelledDate}</TableCell>
                  </TableRow>

                ))}
                </>
            ):(
                <>
                <TableRow>No reservations</TableRow>
                </>
            )}
          
        </TableBody>
      </Table>
    </TableContainer>
        </>
    );

}

export default MyReservationHistoryComponent;