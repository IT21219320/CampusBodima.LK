import { apiSlice } from "./apiSlice";

const Menu_URL = '/api/menues';

export const menuesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addMenu: builder.mutation({
            query: (data) => ({
                url: `${Menu_URL}/add`,
                method: 'POST',
                body: data,
            }),
        }),
        getOwnerMenues: builder.mutation({
            query: (data) => ({
                url: `${Menu_URL}/ownerMenu`,
                method: 'POST',
                body:data,
            }),
        }),
        getBoardingMenues: builder.mutation({
            query: (data) => ({
                url: `${Menu_URL}/boardingMenu`,
                method: 'POST',
                body:data,
            }),
        }),
        updateMenues: builder.mutation({
            query: (data) => ({
                url: `${Menu_URL}/owner`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteMenues: builder.mutation({
            query: (data) => ({
                url: `${Menu_URL}/owner/deletemenu`,
                method: 'DELETE',
                body:data,
            }),
        }),
    }),
});

export const { useAddMenuMutation, useGetOwnerMenuesMutation, useGetBoardingMenuesMutation, useUpdateMenuesMutation, useDeleteMenuesMutation} = menuesApiSlice;