import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import paymentScreenStyles from "../Styles/paymentScreen.module.css";
import PaymentForm from "../components/paymentForm.jsx";
import Header from "../components/header.jsx";
import { useGetBoardingByIdMutation } from "../slices/boardingsApiSlice";

function MakeMonthlyPaymentPage() {

  const { userInfo } = useSelector((state) => state.auth);
  const { bId, amount, payId } = useParams();
  const [boardingDetails, setBoardingDetails] = useState();
  const des = "Monthly payment";

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
      <div style={{ width: '100%' }}>
        <Header />
        <div className={paymentScreenStyles.card} style={{    margin: '145px 12%'}}>
          <Row>

            <Col className={paymentScreenStyles.card40}>
              <h3 className={paymentScreenStyles.h3PaymentTopic}>Payment Summery</h3>
              <hr style={{ color: "white", borderWidth: "2px" }}></hr>
              {boardingDetails ? (
                <>
                  <h5 className={paymentScreenStyles.h5Text}>

                    {boardingDetails.boardingType == "Hostel" ? (
                      <>
                        <p style={{ float: "left", width: "52%" }}>Hostel name</p> <p >{boardingDetails.boardingName}</p>
                      </>) : (
                      <>
                        <p style={{ float: "left", width: "52%" }}>Annex name</p> <p >{boardingDetails.boardingName}</p>
                      </>)}
                  </h5>
                  <hr style={{ color: "white", borderWidth: "2px" }}></hr>
                  <h5 className={paymentScreenStyles.h5Text}><p style={{ float: "left", width: "52%" }}>Facilitites</p>
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

                  {boardingDetails.boardingType == "Hostel" ? (
                    <>
                      <h5 className={paymentScreenStyles.h5Text}><p style={{ float: "left", width: "52%" }}>Monthly Payment</p> <p>LKR {amount}</p></h5>
                    </>) : (
                    <>
                      <h5 className={paymentScreenStyles.h5Text}><p style={{ float: "left", width: "52%" }}>Monthly Payment</p> <p className={paymentScreenStyles.h5Text}>LKR {amount}</p></h5>
                    </>)}


                </>
              ) : (
                <>
                  <h5 className={paymentScreenStyles.h5Text}>No Boarding Selected</h5>
                </>
              )}
            </Col>

            <Col>
              <h3 className={paymentScreenStyles.h3Topic}>Enter card details</h3>
              <div className={paymentScreenStyles.paymentForm}>
                <PaymentForm des={des} amount={amount} payId = {payId}/> 
              </div>
            </Col>
          </Row>
        </div>
      </div >
    </>
  );
}

export default MakeMonthlyPaymentPage;