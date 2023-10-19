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
        getToDoPayment: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/getToDoPaymentsByUserCMonth`,
                method: 'POST',
                body: data,
            }),
        }),
        
        getToDoPaymentOld: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/getToDoPaymentsByUser`,
                method: 'POST',
                body: data,
            }),
        }),
        getToDoPaymentById: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/getToDoPaymentById`,
                method: 'POST',
                body: data,
            }),
        }),
        getAllToDoPaymentById: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/getAllToDoPaymentsByUser`,
                method: 'POST',
                body: data,
            }),
        }),
        changeStatus: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/changeStatus`,
                method: 'POST',
                body: data,
            }),
        }),

        changePaidStatus: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/changeReservationPaidStatus`,
                method: 'POST',
                body: data,
            }),
        }),
        
        getMyRes: builder.mutation({
            query:(data) => ({
                url: `${PAYMENT_URL}/getMyRe`,
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useGetPaymentByUserMutation, useMakePaymentMutation, useGetPaymentByOwnerMutation,useSearchPayMutation, useGetToDoPaymentMutation, useGetMyResMutation, useGetToDoPaymentOldMutation, useChangeStatusMutation, useChangePaidStatusMutation, useGetToDoPaymentByIdMutation, useGetAllToDoPaymentByIdMutation } = paymentApiSlice;