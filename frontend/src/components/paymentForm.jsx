import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form } from "react-bootstrap";
import Button from '@mui/material/Button';
import paymentFormStyle from "../styles/paymentFormStyle.module.css";
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useMakePaymentMutation } from "../slices/paymentApiSlice";
import { useAddCardMutation,useGetCardByUserMutation } from "../slices/cardApiSlice";
import { toast } from 'react-toastify';
import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';



const PaymentForm = ({ des, amount }) => {

    const [cardName, setCardName] = useState('')
    const [cardNumber, setCardNUmber] = useState('')
    const [exDate, setExDate] = useState('')
    const [cvv, setcvv] = useState('')
    const [isChecked, setIsChecked] = useState(false);
    const { bId } = useParams();
    const { userInfo } = useSelector((state) => state.auth);
    const userID = userInfo._id;
    const [cards, setCards] = useState([]);
    const [cardId, setCardId] = useState('');

    
    const [makePayment] = useMakePaymentMutation();
    const [addCard] = useAddCardMutation();
    const [getCards] = useGetCardByUserMutation();


    const navigate = useNavigate();

    const loadData = async()=>{
        try {
            const resCards = await getCards({ userInfo_id: userInfo._id }).unwrap();
            setCards(resCards);
            
      
          } catch (error) {
            console.log(error);
          }
    }

    const handleChange =(e)=>{
        setCardId(e.target.value)
        setCardNUmber(e.target.value.cardNumber)
        setcvv(e.target.value.cvv)
        setExDate(e.target.value.exNumber)
        setCardName(e.target.value.cardName)
    }

    useEffect(()=>{
        loadData();
    },[])

    const handleExDateChange = (e) => {
        let input = e.target.value;
    
        // Remove non-numeric characters
        input = input.replace(/\D/g, '');
    
        // Add a "/" after the first two characters
        if (input.length > 2) {
          input = `${input.slice(0, 2)}/${input.slice(2)}`;
        }
    
        // Update the state
        setExDate(input);
      };

      const handleCardNumberChange = (e) => {
        let input = e.target.value;
    
        // Remove non-numeric characters
        input = input.replace(/\D/g, '');
    
       
    
        // Update the state
        setCardNUmber(input);
      };

    const submitHandler = async (e) => {

        e.preventDefault();
        const resPay = await makePayment({ userInfo_id: userID, bId: bId, des: des, amount:amount })
        if (isChecked) {
            try {
                console.log({ des });
                const res = await addCard({ cardName:cardName, cardNumber: cardNumber, exDate: exDate, cvv: cvv, userInfo_id: userID, bId: bId }).unwrap();

                if (res.message === "Card exist") {
                    toast.warning('Card already saved', { position: toast.POSITION.TOP_RIGHT });
                }

            } catch (err) {
                console.log(err);
            }
        }
        if (resPay) {
            console.log(resPay)
            if (resPay.data.message === "payment inserted") {

                toast.success('Payment successfull!', { position: toast.POSITION.TOP_RIGHT });
                navigate('/occupant/reservations/confirm/');
            }
        }

    }

    return (
        <>

            <div className={paymentFormStyle.formDiv}>

                <Form onSubmit={submitHandler}>

                    <Row className={paymentFormStyle.colPadding}>
                        <TextField id="outlined-basic" label="Name on card" variant="outlined" size="small" value={cardName} required onChange={(e) => setCardName(e.target.value)}  />
                    </Row>

                    <Row className={paymentFormStyle.colPadding}>
                        <TextField id="outlined-basic" label="Card Number" variant="outlined" size="small" value={cardNumber} required onChange={handleCardNumberChange} inputProps={{ maxLength: 16, minLength: 16, inputMode: 'numeric', pattern: '^[0-9]{16}$', title: 'Card number should be 16 digit' }} />
                    </Row>

                    <Row>

                        <Col className={paymentFormStyle.colPadding}>
                            <TextField id="outlined-basic" label="12/30" variant="outlined" size="small" value={exDate} required onChange={handleExDateChange} inputProps={{ maxLength: 5, pattern: '^(0[1-9]|1[0-2])\/[0-9]{2}$', title: 'Please enter a valid date in the format MM/YY' }} />
                        </Col>
                        <Col className={paymentFormStyle.colPadding}>
                            <TextField id="outlined-basic" label="CVV" variant="outlined" size="small" value={cvv} required onChange={(e) => setcvv(e.target.value)} inputProps={{ maxLength: 3, minLength: 3, inputMode: 'numeric', pattern: '^[0-9]{3}$', title: 'Card number should be 16 digit' }} />
                        </Col>
                    </Row>
                    <Row>
                        <FormControlLabel control={<Checkbox />} label="Save card" value={!isChecked} onChange={(e) => setIsChecked(e.target.value)} />
                    </Row>
                    <Button variant="contained" type="submit">Pay</Button>

                </Form>

                <Row  style={{margin: "10% 0px"}} >
                    
                  {cards.length > 0 ? (
                    <>
                    <h6>Choose Your Card</h6>
                      <FormControl style={{ margin:"0px auto"}}>
                        <InputLabel id="demo-simple-select-label" >Saved Cards</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          value={cardId}
                          onChange={handleChange}
                          
                          label='Saved Cards' 
                        >
                          {cards.map((card) => (
                            
                            <MenuItem key={card.id} value={card}>{card.cardNumber}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>

                  ) : (
                  <>
                    
                  </>)}

                </Row>

            </div>
        </>
    )
}

export default PaymentForm;