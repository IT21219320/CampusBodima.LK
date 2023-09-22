import { apiSlice } from "./apiSlice";

const RESERVATION_URL = 'api/reservations';

export const reservationApiSlice = apiSlice.injectEndpoints({
    endpoints:(builder) => ({
        reserveRoom: builder.mutation({
            query:(data) => ({
                url: `${RESERVATION_URL}/bookRoom`,
                method: 'POST',
                body: data,
            }),
        }),
    }),
    
})

export const { useReserveRoomMutation } = reservationApiSlice;