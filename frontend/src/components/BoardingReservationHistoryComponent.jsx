import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { IconButton } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Col, Row } from 'react-bootstrap';

import { useBoardingHistoryMutation } from '../slices/reservationHistoryApiSlice';


const BoardingReservationHistory = ({ bId }) => {

    const searchStyle = {
        width: '55%',
        borderRadius: '20px',
        padding: '6px',
        paddingLeft: '18px',
        border: '2px rgb(176 176 177) solid'
    }

    const [getBoardingHistory] = useBoardingHistoryMutation();

    const [reservationHis, setReservationHis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchWord, setSearchWord] = useState('');
    const [month, setMonth] = useState('');

    const handleMonthChange = (event) => {
        setMonth(event.target.value);
    };

    const sortReservationsByCancelledMonth = (reservations, selectedMonth) => {
        return reservations.filter(reservation => {
            const cancelledDate = new Date(reservation.cancelledDate);
            const cancelledMonth = cancelledDate.toLocaleString('default', { month: 'short' });
            if (selectedMonth === "") {
                return cancelledMonth
            } else {
                return cancelledMonth === selectedMonth
            };
        });
    }

    const handleSearch = (e) => {
        setSearchWord(e.target.value);
    }

    const filteredReservationHist = reservationHis.filter(reservationHistory => {
        return reservationHistory.firstName.toLowerCase().includes(searchWord.toLowerCase()) || reservationHistory.lastName.toLowerCase().includes(searchWord.toLowerCase());
    });

    const sortedReservationsByMonth = sortReservationsByCancelledMonth(filteredReservationHist, month);

    const loadData = async () => {
        try {
            setLoading(true)
            const resBoardingHis = await getBoardingHistory({ boardingId: bId }).unwrap();

            if (resBoardingHis) {
                setReservationHis(resBoardingHis);
            }

            setLoading(false)
        } catch (error) {
            console.log(error);
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
                    <div style={{ width: '130px', float: 'Right', marginTop: '17px' }}>
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

                </Col>

            </Row>





            {loading ?
                (<>
                    <div style={{ width: '100%', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </div>
                </>) : (
                    <>
                        <TableContainer component={Paper} style={{ marginTop: "30px" }}>

                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">

                                <TableHead style={{ backgroundColor: "#242745" }}>
                                    <TableRow>

                                        <TableCell style={{ color: "#ffffff" }}>First Name</TableCell>

                                        <TableCell align="right" style={{ color: "#ffffff" }}>Second Name</TableCell>

                                        <TableCell align="right" style={{ color: "#ffffff" }}>Email</TableCell>

                                        <TableCell align="right" style={{ color: "#ffffff" }}>Phone Number</TableCell>

                                        <TableCell align="right" style={{ color: "#ffffff" }}>Gender</TableCell>

                                        <TableCell align="right" style={{ color: "#ffffff" }}>Room No</TableCell>

                                        <TableCell align="right" style={{ color: "#ffffff" }}>Reserved Date</TableCell>

                                        <TableCell align="right" style={{ color: "#ffffff" }}>Cancelled Date</TableCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ backgroundColor: '#858bc72b' }}>

                                    {reservationHis.length > 0 ? (
                                        <>
                                            {filteredReservationHist.length > 0 ? (
                                                <>
                                                    {sortedReservationsByMonth.length > 0 ? (
                                                        <>
                                                            {sortedReservationsByMonth.map((his) => (
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
                                                            }
                                                        </>) : (
                                                        <>
                                                            <TableRow>
                                                                <TableCell align="right">   </TableCell>

                                                                <TableCell align="right">   </TableCell>

                                                                <TableCell align="right">   </TableCell>

                                                                <TableCell align="right" style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No data to display</TableCell>

                                                                <TableCell align="right">   </TableCell>

                                                                <TableCell align="right">   </TableCell>

                                                                <TableCell align="right">   </TableCell>

                                                                <TableCell align="right">   </TableCell>

                                                            </TableRow>
                                                        </>)}
                                                </>) : (
                                                <>
                                                    <TableRow>
                                                        <TableCell align="right">   </TableCell>

                                                        <TableCell align="right">   </TableCell>

                                                        <TableCell align="right">   </TableCell>

                                                        <TableCell align="right" style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No data to display</TableCell>

                                                        <TableCell align="right">   </TableCell>

                                                        <TableCell align="right">   </TableCell>

                                                        <TableCell align="right">   </TableCell>

                                                        <TableCell align="right">   </TableCell>

                                                    </TableRow></>)}
                                        </>) : (<>
                                            <TableRow>
                                                <TableCell align="right">   </TableCell>

                                                <TableCell align="right">   </TableCell>

                                                <TableCell align="right">   </TableCell>

                                                <TableCell align="right" style={{ fontSize: '20px', fontFamily: 'cursive', color: '#64651d' }}>No data to display</TableCell>

                                                <TableCell align="right">   </TableCell>

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

export default BoardingReservationHistory;