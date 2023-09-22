import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form } from "react-bootstrap";
import Button from '@mui/material/Button';
import paymentFormStyle from "../styles/paymentFormStyle.module.css"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useMakePaymentMutation } from "../slices/paymentApiSlice";
import { useAddCardMutation } from "../slices/cardApiSlice";


const PaymentForm = () => {

    const [cardNumber, setCardNUmber] = useState('')
    const [exDate, setExDate] = useState('')
    const [cvv, setcvv] = useState('')
    const [isChecked, setIsChecked] = useState(false);
    const {bId} = useParams();
    const { userInfo } = useSelector((state) => state.auth);
    const userID = userInfo._id;

    const [makePayment] = useMakePaymentMutation();
    const [addCard] = useAddCardMutation();

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        console.log(isChecked)
        e.preventDefault();
        const resPay = await makePayment({userInfo_id:userID, bId:bId})

        console.log(resPay)
        if(isChecked){
            try {
                const res = await addCard( { cardNumber: cardNumber, expireDate:exDate, cvv:cvv, userInfo_id: userID, bId:bId} ).unwrap();
                
                if(res.message === "Card exist"){
                    window.alert('Card already saved');
                }
   
            } catch (err) {
                console.log(err);
            }
        }
        if(resPay){
            if(resPay.data.message === "payment inserted"){
                window.alert('Payment successfull');
                navigate('/occupant/reservation/confirm/');
            }
        }
        
        
    }

    
    return (
        <>
            <div className={paymentFormStyle.formDiv}>

                <Form onSubmit={submitHandler}>
                    <Row>
                        <TextField id="outlined-basic" label="Card Number" variant="outlined" size="small" value={cardNumber} onChange={(e) => setCardNUmber(e.target.value)} inputProps={{maxLength: 16, minLength:16 ,inputMode: 'numeric',title:'Card number should be 16 digit'}}/>
                    </Row>

                    <Row>
                        <Col className={paymentFormStyle.colPadding}>
                            <TextField id="outlined-basic" label="12/30" variant="outlined" size="small" value={exDate} onChange={(e) => setExDate(e.target.value)} inputProps={{pattern: '^(0[1-9]|1[0-2])\/[0-9]{2}$', title: 'Please enter a valid date in the format MM/YY'}} />
                        </Col>
                        <Col className={paymentFormStyle.colPadding}>
                            <TextField id="outlined-basic" label="CVV" variant="outlined" size="small" value={cvv} onChange={(e) => setcvv(e.target.value)} inputProps={{maxLength: 3, minLength:3 ,inputMode: 'numeric',title:'Card number should be 16 digit'}}/>
                        </Col>
                    </Row>
                    <Row>
                        <FormControlLabel control={<Checkbox />} label="Save card" value={!isChecked} onChange={(e) => setIsChecked(e.target.value)} />
                    </Row>
                        <Button variant="contained" type="submit">Pay</Button>
                    

                </Form>



            </div>
        </>
    )
}

export default PaymentForm;