import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Form } from "react-bootstrap";
import Button from '@mui/material/Button';
import paymentFormStyle from "../styles/paymentFormStyle.module.css"
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

const ReservationForm = () => {

    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [paymentType, setPaymentType] = useState(''); 


    const submitHandler = async (e) => {

    }


    return (
        <>
            <div className={paymentFormStyle.formDiv}>

                <Form className={reserveFormStyle.formDiv}>
                    <Row>
                        <Col>
                            <TextField id="standard-basic" label="First Name" value="dewmina" variant="standard" InputProps={{ readOnly: true, }} />
                        </Col>

                        <Col>
                            <TextField id="standard-basic" label="Second Name" value="Basitha" variant="standard" InputProps={{ readOnly: true, }} />
                        </Col>
                    </Row>

                    <Row className={reserveFormStyle.email}>
                        <TextField id="standard-basic" label="Email" value="email" variant="standard" InputProps={{ readOnly: true, }} />
                    </Row>

                    <Row className={reserveFormStyle.Gender}>
                        <FormControl>
                            <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                requiredvalue={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                            >
                                <FormControlLabel value="female" control={<Radio />} label="Female" />
                                <FormControlLabel value="male" control={<Radio />} label="Male" />

                            </RadioGroup>
                        </FormControl>
                    </Row>

                    <Row className={reserveFormStyle.durationRaw}>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-standard-label">Duration</InputLabel>
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                label="Age"
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