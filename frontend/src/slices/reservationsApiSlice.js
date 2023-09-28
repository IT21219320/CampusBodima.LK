import { apiSlice } from "./apiSlice";

const RESERVATION_URL = '/api/reservations';

export const reservationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        reserveRoom: builder.mutation({
            query: (data) => ({
                url: `${RESERVATION_URL}/bookRoom`,
                method: 'POST',
                body: data,
            }),
        }),

        updateDuration: builder.mutation({
            query: (data) => ({
                url: `${RESERVATION_URL}/updateDuration`,
                method: 'PUT',
                body: data,
            }),
        }),

        getMyReservation: builder.mutation({
            query: (data) => ({
                url: `${RESERVATION_URL}/MyRoom`,
                method: 'POST',
                body: data,
            }),
        }),

        getBoardingReservations: builder.mutation({
            query: (data) => ({
                url: `${RESERVATION_URL}/veiwReservations`,
                method: 'POST',
                body: data,
            }),
        }),

        getPendingReservations: builder.mutation({
            query: (data) => ({
                url: `${RESERVATION_URL}/pending`,
                method: 'POST',
                body: data,
            }),
        }),

        approvePendingStatus: builder.mutation({
            query: (data) => ({
                url: `${RESERVATION_URL}/aprovePending`,
                method: 'PUT',
                body:data
            }),
        }),

        deletePendingStatus: builder.mutation({
            query: (data) => ({
                url: `${RESERVATION_URL}/deletePending`,
                method: 'DELETE',
                body: data
            }),
        }),

        deleteReservation: builder.mutation({
            query: (data) => ({
                url: `${RESERVATION_URL}/deleteReservation`,
                method: 'DELETE',
                body: data,
            }),
        }),

    }),    

})

export const {
    useReserveRoomMutation,
    useUpdateDurationMutation,
    useGetMyReservationMutation,
    useGetBoardingReservationsMutation,
    useGetPendingReservationsMutation,
    useApprovePendingStatusMutation,
    useDeletePendingStatusMutation,
    useDeleteReservationMutation,
} = reservationApiSlice;