import { PaymentElement, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { useMakePaymentMutation } from "../slices/paymentApiSlice";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  
  const { userInfo } = useSelector((state) => state.auth);
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [makePayment] = useMakePaymentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        
        // Make sure to change this to your payment completion page
        return_url: `http://localhost:3001/success`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
      setIsProcessing(false);
    } else {
      
      const id = userInfo._id
      const reqData = {userID: id}
      const res = await makePayment({reqData}).unwrap();
      setIsProcessing(false);
    }
    

    
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isProcessing || !stripe || !elements} style={{backgroundColor: "blue", width:"25%", borderRadius:"5px", float:"right", transition: "background-color 0.3s",}} onMouseEnter={() => {this.style.backgroundColor = "red";}}  onMouseLeave={() => {this.style.backgroundColor = "blue";}} >
        <span id="button-text">
          {isProcessing ? "Processing ... " : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}