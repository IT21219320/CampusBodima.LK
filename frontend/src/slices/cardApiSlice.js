import id from "date-fns/locale/id";
import { apiSlice } from "./apiSlice";

const CARD_URL = '/api/cards';

export const paymentApiSlice = apiSlice.injectEndpoints({
    endpoints:(builder) => ({
        addCard: builder.mutation({
            query:(data) => ({
                url: `${CARD_URL}/addCard`,
                method: 'POST',
                body: data,
            }),
        }),
        /*getPaymentByUser: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/getPayment`,
                method: 'POST',
                body: data,
            }),
        }),*/
    }),
});

export const { useAddCardMutation } = paymentApiSlice;