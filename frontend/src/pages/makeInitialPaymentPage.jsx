import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import paymentScreenStyles from "../Styles/paymentScreen.module.css";
import PaymentForm from "../components/paymentForm.jsx";
import { useGetBoardingByIdMutation } from "../slices/boardingsApiSlice";
import Header from "../components/header.jsx";

function MakeInitialPaymentPage() {

  const [activeStep, setActiveStep] = useState(2);
  const [boardingDetails, setBoardingDetails] = useState();
  console.log(boardingDetails)
  const { bId } = useParams();
  const [getBoardingById] = useGetBoardingByIdMutation();

  const load = async () => {
    try {
      const boardingId = bId;
      const res = await getBoardingById(boardingId).unwrap();
      setBoardingDetails(res.boarding)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
    <div style={{width:'100%'}}>
    <Header />
      <div style={{ width: '100%' }}>
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
              <hr style={{ color: "white", borderWidth: "2px" }}></hr>
              <h5 className={paymentScreenStyles.h5Text}>
                {boardingDetails ? (
                  boardingDetails.boardingType == "Hostel" ? (
                    <>
                      Hostel name <p style={{ float: "right" }}>{boardingDetails.boardingName}</p>
                    </>) : (
                    <>
                      Annex name <p style={{ float: "right" }}>{boardingDetails.boardingName}</p>
                    </>)) : (
                  <>

                  </>
                )}
              </h5>
              <hr style={{ color: "white", borderWidth: "2px" }}></hr>
              <h5 className={paymentScreenStyles.h5Text}>Additional options</h5>
              <hr style={{ color: "white", borderWidth: "2px" }}></hr>
              <h5 className={paymentScreenStyles.h5Text}>
                {boardingDetails ? (
                  boardingDetails.boardingType == "Hostel" ? (
                    <>Initial Payment <p style={{ float: "right" }}>LKR {(boardingDetails.room[0].keyMoney)*(boardingDetails.room[0].rent)}</p>
                    </>) : (
                    <></>)) : (<></>)}</h5>

            </Col>
            <Col>
              <h3 className={paymentScreenStyles.h3Topic}>Enter card details</h3>
              <div className={paymentScreenStyles.paymentForm}>
                <PaymentForm />
              </div>
            </Col>
          </Row>
        </div>
      </div>
      </div>
    </>
  );
}

export default MakeInitialPaymentPage;