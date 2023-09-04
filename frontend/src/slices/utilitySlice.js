import { apiSlice } from "./apiSlice";

const UTILITIES_URL = '/api/utilities';

export const utilitiesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addUtilities: builder.mutation({
            query: (data) => ({
                url: `${UTILITIES_URL}/addUtility`,
                method: 'POST',
                body: data,
            }),
        }),
        getUtilitiesForBoarding : builder.mutation({
            query: (data) => ({
                url: `${UTILITIES_URL}/owner/${boardingId}/${utilityType}`,
                method: 'GET',
            }),
        }),
        getUtilitiesForOccupant: builder.mutation({
            query: ({ occupantId, boardingId, utilityType }) => ({
                url: `${UTILITIES_URL}/occupants/${occupantId}/${boardingId}/${utilityType}`,
                method: 'GET',
            }),
        }),
        updateUtility: builder.mutation({
            query: ({ boardingId, utilityType, utilityId, data }) => ({
                url: `${UTILITIES_URL}/owner/${boardingId}/${utilityType}/${utilityId}`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteUtility: builder.mutation({
            query: ({ boardingId, utilityId, utilityType }) => ({
                url: `${UTILITIES_URL}/owner/${boardingId}/${utilityId}/${utilityType}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useAddUtilitiesMutation, useGetUtilitiesForBoardingMutation,useGetUtilitiesForOccupantMutation, useUpdateUtilityMutation,useDeleteUtilityMutation, } = utilitiesApiSlice;