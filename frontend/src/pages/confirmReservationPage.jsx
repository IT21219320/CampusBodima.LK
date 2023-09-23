import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {Row, Col} from "react-bootstrap";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import paymentScreenStyles from "../Styles/paymentScreen.module.css";



function ConfirmReservationPage() {

  const { userInfo } = useSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(4);

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