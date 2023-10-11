import { apiSlice } from "./apiSlice";

const RESERVATIONHIST_URL = '/api/reservationsHistory';

export const reservationHistoryApiSlice = apiSlice.injectEndpoints({

    endpoints: (builder) => ({

        boardingHistory: builder.mutation({
            query: (data) => ({
                url: `${RESERVATIONHIST_URL}/BoardingHistory`,
                method: 'POST',
                body: data,
            }),
        }),

        myHistory: builder.mutation({
            query: (data) => ({
                url: `${RESERVATIONHIST_URL}/myHistory`,
                method: 'POST',
                body: data,
            }),
        }),


    }),

})

export const {
    useBoardingHistoryMutation,
    useMyHistoryMutation,
} = reservationHistoryApiSlice;
