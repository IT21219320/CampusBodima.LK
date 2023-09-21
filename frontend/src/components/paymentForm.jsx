import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {Row, Col, Form} from "react-bootstrap";
import Button from '@mui/material/Button';
import paymentFormStyle from "../styles/paymentFormStyle.module.css"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const PaymentForm = () =>{

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
                        <TextField id="outlined-basic" label="Card Number" variant="outlined" size="small" onChange={ (e) => setCardNUmber(e.target.value)}/>
                    </Row>
                    
                    <Row>
                        <Col className={paymentFormStyle.colPadding}>
                            <TextField id="outlined-basic" label="12/30" variant="outlined" size="small" onChange={ (e) => setExDate(e.target.value)}/>
                        </Col>
                        <Col className={paymentFormStyle.colPadding}>
                            <TextField id="outlined-basic" label="CVV" variant="outlined" size="small" onChange={ (e) => setcvv(e.target.value)}/>
                        </Col>
                    </Row>
                    <Button variant="contained" type="submit">Pay</Button>
                    
                    
                    
                    
                </Form>
                
                

            </div>
        </>
    )
}

export default PaymentForm;