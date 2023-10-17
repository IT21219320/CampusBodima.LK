import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useMyHistoryMutation } from '../slices/reservationHistoryApiSlice';
import { Icon, IconButton } from '@mui/material';


const MyReservationHistoryComponent = () => {

    const searchStyle = {
        width: '29%',
        borderRadius: '20px',
        padding: '6px',
        paddingLeft: '18px',
        border: '2px rgb(176 176 177) solid'
    }

    const { userInfo } = useSelector((state) => state.auth);

    const [myHistory] = useMyHistoryMutation();
    const navigate = useNavigate();

    const [myHistoryDetails, setMyHistoryDetails] = useState([]);
    const [word, setWord] = useState();

    const feedbackHandler = (Id,BName) => {
        navigate(`/occupant/feedback/create/${Id}/${BName}`)
    }

    const loadData = async () => {
        try {
            const res = await myHistory({ userID: userInfo._id, word:word }).unwrap();
            console.log(res)
            if (res) {
                setMyHistoryDetails(res);
                console.log(myHistoryDetails)
            }
        } catch (error) {
            console.error('error getting reservation history', error);
        }
    }

    useEffect(() => {
        loadData();
    }, [word]);



    return (
        <>
            <div style={{marginTop: '17px'}}>
                <input id="outlined-search" type="search" placeholder="Search boarding name..." style={searchStyle} onChange={(e) => setWord(e.target.value)}/>

                <IconButton>
                    <SearchIcon />
                </IconButton>
            </div>


            <TableContainer component={Paper} style={{ marginTop: '35px' }}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead style={{ backgroundColor: "#242745" }}>
                        <TableRow>
                            <TableCell style={{ color: "#ffffff" }}>Boarding Name</TableCell>
                            <TableCell style={{ color: "#ffffff" }} align="right">Boarding Type</TableCell>
                            <TableCell style={{ color: "#ffffff" }} align="right">Room No</TableCell>
                            <TableCell style={{ color: "#ffffff" }} align="right">Reserved Date</TableCell>
                            <TableCell style={{ color: "#ffffff" }} align="right">Cancelled Date</TableCell>
                            <TableCell style={{ color: "#ffffff" }} align="right">FeedBack</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody style={{ backgroundColor: '#858bc72b' }}>
                        {myHistoryDetails.length > 0 ? (
                            <>
                                {myHistoryDetails.map((myHis) => (
                                    <TableRow
                                        key={myHis._id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {myHis.boarding.boardingName}
                                        </TableCell>
                                        <TableCell align="right">{myHis.boarding.boardingType}</TableCell>
                                        {myHis.boarding.boardingType === 'Hostel' ? (<>
                                            <TableCell align="right">{myHis.room.roomNo}</TableCell>
                                        </>):(<><TableCell align="right"> - </TableCell></>)}
                                        <TableCell align="right">{new Date(myHis.ReservedDate).toDateString()}</TableCell>
                                        <TableCell align="right">{new Date(myHis.cancelledDate).toDateString()}</TableCell>
                                        <TableCell align="right"><Button variant="contained" size="small" onClick={() =>feedbackHandler(myHis.boarding._id,myHis.boarding.boardingName)}>give FeedBack</Button></TableCell>
                                    </TableRow>

                                ))}
                            </>
                        ) : (
                            <>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No reservations</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>

                            </>
                        )}

                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );

}

export default MyReservationHistoryComponent;