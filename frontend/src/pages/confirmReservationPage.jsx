import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {Row, Col} from "react-bootstrap";
import { Elements } from "@stripe/react-stripe-js";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { loadStripe } from "@stripe/stripe-js";
import paymentScreenStyles from "../Styles/paymentScreen.module.css";
import { useMakePaymentMutation } from "../slices/paymentApiSlice";
import { useParams } from "react-router-dom";
import {setConfirmPaymentStatus} from '../slices/customizeSlice';

function ConfirmReservationPage() {

  const { userInfo } = useSelector((state) => state.auth);

  /*const insertData = async() => {
    const reqData = { userID: userInfo._id, id };
      try {
        console.log('dcdf');
        dispatch(setConfirmPaymentStatus({status:1})); 
        const res = await makePayment({ reqData }).unwrap();
      } catch (error) {
        console.error(error);
      }
  }*/


  return (
    <>
      <div style={{width:'100%'}}>
        <div className={paymentScreenStyles.stepperDiv}>
          <Stepper activeStep={activeStep}>
              <Step>
                <StepLabel>Reservation</StepLabel>
              </Step>
              <Step>
                <StepLabel>User Details</StepLabel>
              </Step>
              <Step>
                <StepLabel>Payment</StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirm Reservation</StepLabel>
              </Step>
          </Stepper>
        </div>
        <div className={paymentScreenStyles.card}>
          <Row>
            <Col className={paymentScreenStyles.card40}>
              <h3 className={paymentScreenStyles.h3PaymentTopic}>Payment Confirmed</h3>
            </Col>
            <Col>
            
            </Col>
        </Row>
        </div>
      </div>
    </>
  );
}

export default ConfirmReservationPage;