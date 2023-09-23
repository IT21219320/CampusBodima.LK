
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
                url: `${UTILITIES_URL}/owner/utilities`,
                method: 'POST',
                body:data,
            }),
        }),
        getUtilitiesForOccupant: builder.mutation({
            query: ( data) => ({
                url: `${UTILITIES_URL}/occupants/${data}`,
                method: 'GET',
            }),
        }),
        updateUtility: builder.mutation({
            query: (data) => ({
                url: `${UTILITIES_URL}/owner/${data}`,
                method: 'PUT',
                body: data,
            }),
        }),
        getUpdateUtility: builder.mutation({
            query: ( data) => ({
                url: `${UTILITIES_URL}/owner/update/${data}`,
                method: 'GET',
            }),
        }),
        deleteUtility: builder.mutation({
            query: (data) => ({
                url: `${UTILITIES_URL}/owner/${data}`,
                method: 'DELETE',
            }),
        }),
       getFacilitiesBoarding: builder.mutation({
            query: (data) => ({
                url: `${UTILITIES_URL}/owner/${data}/${data}`,
                method: 'GET',
            }),
        }),
        getUtilityBoarding: builder.mutation({
            query: (data) => ({
                url: `${UTILITIES_URL}/owner/${data}`,
                method: 'GET',
            }),
        }),
        getOccupant: builder.mutation({
            query: (data) => ({
                url: `${UTILITIES_URL}/boarding/${data}`,
                method: 'GET',
            }),
        })
    }),
});

export const { useAddUtilitiesMutation,useGetUtilitiesForBoardingMutation,useGetUtilitiesForOccupantMutation,useUpdateUtilityMutation,useDeleteUtilityMutation,useGetOccupantMutation,useGetUtilityBoardingMutation,useGetFacilitiesBoardingMutation,useGetUpdateUtilityMutation} = utilitiesApiSlice;