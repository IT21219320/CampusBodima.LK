import { apiSlice } from "./apiSlice";

const BOARDINGS_URL = '/api/boardings';

export const boardingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        registerBoarding: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/register`,
                method: 'POST',
                body: data,
            }),
        }),
        addRoom: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/addroom`,
                method: 'POST',
                body: data
            }),
        }),
        getOwnerBoardings: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/owner/${data}`,
                method: 'GET',
            }),
        }),
        updateVisibility: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/updateBoardingVisibility`,
                method: 'PUT',
                body: data
            }),
        }),
        deleteBoarding:builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/deleteBoarding/${data}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useRegisterBoardingMutation, useAddRoomMutation, useGetOwnerBoardingsMutation, useUpdateVisibilityMutation, useDeleteBoardingMutation } = boardingsApiSlice;