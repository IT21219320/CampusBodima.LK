import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {Row, Col} from "react-bootstrap";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import paymentScreenStyles from "../Styles/paymentScreen.module.css";
import ReservationForm from "../components/reservationForm";

const ReserveBoardingPage = () =>{

  const { userInfo } = useSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(1);
  

    
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
              <h3 className={paymentScreenStyles.h3PaymentTopic}>Booking Summery</h3>
              <hr style={{color:"white", borderWidth: "2px"}}></hr>
              <h5 className={paymentScreenStyles.h5Text}>Room Number</h5>
              <hr style={{color:"white", borderWidth: "2px"}}></hr>
              <h5 className={paymentScreenStyles.h5Text}>Additional options</h5>
              <hr style={{color:"white", borderWidth: "2px"}}></hr>
              <h5 className={paymentScreenStyles.h5Text}>Initial Payment</h5>
              
            </Col>
            <Col>
            <h3 className={paymentScreenStyles.h3Topic}>Enter Occupant details</h3>
            <div className={paymentScreenStyles.paymentForm}>
                <ReservationForm/>
              </div>
            </Col>
        </Row>
        </div>
      </div>
    </>
  );
}

export default ReserveBoardingPage