import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Form } from "react-bootstrap";
import Button from '@mui/material/Button';
import paymentFormStyle from "../styles/paymentFormStyle.module.css"
import { useNavigate, useParams } from "react-router-dom";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import reserveFormStyle from "../styles/reserveFormStyle.module.css";
import { useReserveRoomMutation } from "../slices/reservationsApiSlice";

const ReservationForm = () => {

    const [gender, setGender] = useState('');
    const [duration, setDuration] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const { bId, rId } = useParams();
    console.log()
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [reserveRoom] = useReserveRoomMutation()
    const no = 1;
    const submitHandler = async (e) => {
        e.preventDefault();

        console.log(gender);
        console.log(duration);
        console.log(paymentType);
        console.log(bId);
        console.log(userInfo._id);
        const userID = userInfo._id;
        const res = await reserveRoom({ Gender: gender, Duration: duration, userInfo_id: userID, BoardingId: bId, RoomID: rId }).unwrap();
        console.log(res)

        if (res) {
            if (paymentType === "Online") {
                navigate(`/occupant/makePayment/${bId}`);
            }else{
                window.alert("Wait until the owner approve")
                navigate(`/occupant/reservations`);
            }

        }

    }


    return (
        <>
            <div className={paymentFormStyle.formDiv}>

                <Form className={reserveFormStyle.formDiv} onSubmit={submitHandler}>
                    <Row>
                        <Col>
                            <TextField id="standard-basic" label="First Name" value={userInfo.firstName} variant="standard" InputProps={{ readOnly: true, }} />
                        </Col>

                        <Col>
                            <TextField id="standard-basic" label="Second Name" value={userInfo.lastName} variant="standard" InputProps={{ readOnly: true, }} />
                        </Col>
                    </Row>

                    <Row className={reserveFormStyle.email}>
                        <TextField id="standard-basic" label="Email" value={userInfo.email} variant="standard" InputProps={{ readOnly: true, }} />
                    </Row>

                    <Row className={reserveFormStyle.Gender}>
                        <FormControl>
                            <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                            >
                                <FormControlLabel value="Female" control={<Radio />} label="Female" />
                                <FormControlLabel value="Male" control={<Radio />} label="Male" />

                            </RadioGroup>
                        </FormControl>
                    </Row>

                    <Row className={reserveFormStyle.durationRaw}>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-standard-label">Duration</InputLabel>
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                label="duration"
                                required
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={3}>03 Months</MenuItem>
                                <MenuItem value={6}>06 Months</MenuItem>
                                <MenuItem value={12}>01 Year</MenuItem>
                                <MenuItem value={24}>02 Years</MenuItem>
                            </Select>
                        </FormControl>
                    </Row>

                    <Row className={reserveFormStyle.Gender}>
                        <FormControl>
                            <FormLabel id="demo-row-radio-buttons-group-label">Payment Type</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                                required
                            >
                                <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
                                <FormControlLabel value="Online" control={<Radio />} label="Online" />

                            </RadioGroup>
                        </FormControl>
                    </Row>
                    <Button variant="contained" type="submit">Next</Button>

                </Form>



            </div>
        </>
    )
}

export default ReservationForm;