import id from "date-fns/locale/id";
import { apiSlice } from "./apiSlice";

const PAYMENT_URL = '/api/payments';

export const paymentApiSlice = apiSlice.injectEndpoints({
    endpoints:(builder) => ({
        makePayment: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/make`,
                method: 'POST',
                body: data,
            }),
        }),
        getPaymentByUser: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/getPayment`,
                method: 'POST',
                body: data,
            }),
        }),
        getPaymentByOwner: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/getPaymentOwner`,
                method: 'POST',
                body: data,
            }),
        }),
        searchPay: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/searchPay`,
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useGetPaymentByUserMutation, useMakePaymentMutation, useGetPaymentByOwnerMutation,useSearchPayMutation } = paymentApiSlice;