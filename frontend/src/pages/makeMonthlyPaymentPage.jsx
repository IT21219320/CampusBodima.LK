import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
import paymentScreenStyles from "../Styles/paymentScreen.module.css";
import PaymentForm from "../components/paymentForm.jsx";

function MakeMonthlyPaymentPage() {

  const { userInfo } = useSelector((state) => state.auth);

  return (
    <>
      <div className={paymentScreenStyles.card}>
        <Row>
          <Col className={paymentScreenStyles.card40}>
            <h3 className={paymentScreenStyles.h3PaymentTopic}>Payment Summery</h3>
            <hr style={{ color: "white", borderWidth: "2px" }}></hr>
            <h5 className={paymentScreenStyles.h5Text}>Room Number</h5>
            <hr style={{ color: "white", borderWidth: "2px" }}></hr>
            <h5 className={paymentScreenStyles.h5Text}>Additional options</h5>
            <hr style={{ color: "white", borderWidth: "2px" }}></hr>
            <h5 className={paymentScreenStyles.h5Text}>Monthly Payment</h5>
          </Col>
          <Col>
            <h3 className={paymentScreenStyles.h3Topic}>Enter card details</h3>
            <div className={paymentScreenStyles.paymentForm}>
              <PaymentForm />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default MakeMonthlyPaymentPage;