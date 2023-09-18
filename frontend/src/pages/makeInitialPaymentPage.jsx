import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {Row, Col} from "react-bootstrap";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/checkoutForm";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { loadStripe } from "@stripe/stripe-js";
import paymentScreenStyles from "../Styles/paymentScreen.module.css";

function MakeInitialPaymentPage() {
  const [stripePromise, setStripePromise] = useState('');
  const [clientSecret, setClientSecret] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(2);
  
  useEffect(() => {

    fetch("api/payment/config")
      .then(async (r) => {
        const { publishableKey } = await r.json();
        setStripePromise(loadStripe(publishableKey));
      });


    const id = userInfo._id
    const reqData = {userID: id}
    fetch("api/payment/create-payment-intent", {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    })
    .then((res) => res.json())
    .then(({clientSecret}) =>setClientSecret(clientSecret));

  }, []);

  return (
    <>
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
            <h3 className={paymentScreenStyles.h3PaymentTopic}>Payment Summery</h3>
            <hr style={{color:"white", borderWidth: "2px"}}></hr>
            <h5 className={paymentScreenStyles.h5Text}>Room Number</h5>
            <hr style={{color:"white", borderWidth: "2px"}}></hr>
            <h5 className={paymentScreenStyles.h5Text}>Additional options</h5>
            <hr style={{color:"white", borderWidth: "2px"}}></hr>
            <h5 className={paymentScreenStyles.h5Text}>Initial Payment</h5>
            
          </Col>
          <Col>
          <h3 className={paymentScreenStyles.h3Topic}>Enter card details</h3>
          <div className={paymentScreenStyles.paymentForm}>
              {clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm />
                </Elements>
              )}
            </div>
          </Col>
      </Row>
      </div>
    </>
  );
}

export default MakeInitialPaymentPage;