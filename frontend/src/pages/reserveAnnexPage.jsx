import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import paymentScreenStyles from "../Styles/paymentScreen.module.css";
import ReservationForm from "../components/reservationForm";
import { CircularProgress } from "@mui/material";
import Header from "../components/header.jsx";
import { useGetBoardingByIdMutation } from "../slices/boardingsApiSlice";


const ReserveAnnexPage = () => {

  const { userInfo } = useSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(1);
  const [boardingDetails, setBoardingDetails] = useState();
  const [loading, setLoading] = useState(true);
  const des = "Initial payment";

  const { bId } = useParams();
  const [getBoardingById] = useGetBoardingByIdMutation();


  const load = async () => {
    try {
      setLoading(true)
      const boardingId = bId;
      const res = await getBoardingById(boardingId).unwrap();
      setBoardingDetails(res.boarding)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }
  let am
  if (boardingDetails) {
    if (boardingDetails.boardingType == 'Hostel') {
      am = (boardingDetails.room[0].keyMoney) * (boardingDetails.room[0].rent)
    }
    else {
      am = boardingDetails.keyMoney * boardingDetails.rent
    }
  }


  useEffect(() => {
    load()
  }, [])



  return (
    <>
      <div style={{ width: '100%' }}>

        <Header />
        <div style={{ width: '100%', marginTop: '120px' }}>

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

              {loading ? (
                <>
                  <div style={{ width: '60%', height: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress />
                  </div>
                </>) : (
                <>
                  <Col className={paymentScreenStyles.card40}>

                    <h3 className={paymentScreenStyles.h3PaymentTopic}>Payment Summery</h3>

                    <hr style={{ color: "white", borderWidth: "2px" }}></hr>

                    {boardingDetails ? (<>
                      <h5 className={paymentScreenStyles.h5Text}>
                        {boardingDetails ? (
                          boardingDetails.boardingType == "Hostel" ? (
                            <>
                              <p style={{ float: "left", width: "52%" }}>Hostel name</p> <p >{boardingDetails.boardingName}</p>
                            </>) : (
                            <>
                              <p style={{ float: "left", width: "52%" }}>Annex name</p> <p >{boardingDetails.boardingName}</p>
                            </>)) : (
                          <>

                          </>
                        )}

                      </h5>

                      <hr style={{ color: "white", borderWidth: "2px" }}></hr>

                      <h5 className={paymentScreenStyles.h5Text}>Additional options

                        {boardingDetails.facilities && boardingDetails.facilities.length > 0 ? (
                          <ul style={{ margin: "0% 0px 0px 52%" }}>
                            {boardingDetails.facilities.map((facility, index) => (
                              <li key={index}>{facility}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No facilities specified</p>
                        )}
                      </h5>
                      <hr style={{ color: "white", borderWidth: "2px" }}></hr>
                      <h5 className={paymentScreenStyles.h5Text}></h5>

                      {boardingDetails.boardingType == "Hostel" ? (
                        <>
                          <h5 className={paymentScreenStyles.h5Text}><p style={{ float: "left", width: "52%" }}>Initial Payment</p> <p>LKR {am}</p></h5>
                        </>) : (
                        <>
                          <h5 className={paymentScreenStyles.h5Text}><p style={{ float: "left", width: "52%" }}>Initial Payment</p> <p className={paymentScreenStyles.h5Text}>LKR {am}</p></h5>
                        </>)}</>) : (<><h5>No Boarding</h5></>)}


                  </Col>
                </>)}

              <Col>

                <h3 className={paymentScreenStyles.h3Topic}>Enter Occupant details</h3>
                <div className={paymentScreenStyles.paymentForm}>

                  <ReservationForm />

                </div>

              </Col>

            </Row>

          </div>

        </div>

      </div>

    </>
  );
}

export default ReserveAnnexPage