import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {Row, Col, Form} from "react-bootstrap";
import Button from '@mui/material/Button';
import paymentFormStyle from "../styles/paymentFormStyle.module.css"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const ReservationForm = () =>{

    const [cardNumber, setCardNUmber] = useState('')
    const [exDate, setExDate] = useState('')
    const [cvv, setcvv] = useState('') 

    const  submitHandler = async(e) => {

    }


    return(
        <>
            <div className={paymentFormStyle.formDiv}>
                
                <Form >
                    <Row>
                    <TextField id="standard-basic" label="Name" value="dewmina" variant="standard" InputProps={{readOnly: true,}}/>
                    </Row>
                    
                    
                    <Button variant="contained" type="submit">Pay</Button>
                    
                    
                    
                    
                </Form>
                
                

            </div>
        </>
    )
}

export default ReservationForm;