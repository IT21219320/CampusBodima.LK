import { PaymentElement, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { useMakePaymentMutation } from "../slices/paymentApiSlice";
import {setConfirmPaymentStatus} from '../slices/customizeSlice';
import { CardElement, CardCvcElement } from "@stripe/react-stripe-js";

export default function CheckoutForm({clientSecret}) {
  const stripe = useStripe();
  const dispatch = useDispatch();
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
    dispatch(setConfirmPaymentStatus({status:0})); 
    
    /*const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        
        // Make sure to change this to your payment completion page
        return_url: `http://localhost:3000/occupant/reservation/confirm`,
      },
    });*/
    const cardElement = elements.getElement(Card);
    console.log(cardElement)
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement) ,
      },
    });

    setMessage(result)
    //error.type === "card_error" || error.type === "validation_error"
    if (result.error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else {
      
      const id = userInfo._id
      const reqData = {userID: id}
      const res = makePayment({reqData}).unwrap()
      setIsProcessing(false);
    }
    

    
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isProcessing || !stripe || !elements} style={{backgroundColor: "blue", width:"25%", borderRadius:"5px", float:"right", transition: "background-color 0.3s",}}  >
        <span id="button-text">
          {isProcessing ? "Processing ... " : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}