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
        addOccupant: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/addoccupant`,
                method: 'POST',
                body: data
            }),
        }),
        occupantJoin: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/occupant/join`,
                method: 'POST',
                body: data
            }),
        }),
        getAllBoardings: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/all`,
                method: 'POST',
                body: data
            }),
        }),
        getAllPublicBoardings: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/search`,
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
        getPendingApprovalBoardings: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/pendingApproval/${data}`,
                method: 'GET',
            }),
        }),
        approveBoarding: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/approveBoarding/`,
                method: 'PUT',
                body:data
            }),
        }),
        rejectBoarding: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/rejectBoarding/`,
                method: 'PUT',
                body:data
            }),
        }),
        approveRoom: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/approveRoom/`,
                method: 'PUT',
                body:data
            }),
        }),
        rejectRoom: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/rejectRoom/`,
                method: 'PUT',
                body:data
            }),
        }),
        getReservationsByBoardingId: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/${data}/reservations`,
                method: 'GET',
            }),
        }),
        getReservationsByRoomId: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/room/${data}/reservations`,
                method: 'GET',
            }),
        }),
        getBoardingById: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/${data}`,
                method: 'GET',
            }),
        }),
        getRoomById: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/room/${data}`,
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
        updateRoomVisibility: builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/updateRoomVisibility`,
                method: 'PUT',
                body: data
            }),
        }),
        updateBoarding:builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/updateBoarding`,
                method: 'PUT',
                body: data
            }),
        }),
        updateRoom:builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/updateRoom`,
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
        deleteRoom:builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/deleteRoom/${data}`,
                method: 'DELETE',
            }),
        }),
        deleteBoardingReservation:builder.mutation({
            query: (data) => ({
                url: `${BOARDINGS_URL}/deleteReservation/${data}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { 
    useRegisterBoardingMutation, 
    useAddRoomMutation, 
    useAddOccupantMutation,
    useOccupantJoinMutation,
    useGetAllBoardingsMutation, 
    useGetAllPublicBoardingsMutation, 
    useGetOwnerBoardingsMutation, 
    useGetPendingApprovalBoardingsMutation, 
    useApproveBoardingMutation, 
    useRejectBoardingMutation, 
    useApproveRoomMutation,
    useRejectRoomMutation,
    useGetBoardingByIdMutation, 
    useGetReservationsByBoardingIdMutation, 
    useGetReservationsByRoomIdMutation,
    useGetRoomByIdMutation, 
    useUpdateVisibilityMutation, 
    useUpdateRoomVisibilityMutation, 
    useUpdateBoardingMutation, 
    useUpdateRoomMutation, 
    useDeleteBoardingMutation, 
    useDeleteRoomMutation,
    useDeleteBoardingReservationMutation 
} = boardingsApiSlice;