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
                url: `${Menu_URL}/owner/${data}`,
                method: 'GET',
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
                url: `${Menu_URL}/owner/${data}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useAddMenuMutation, useGetOwnerMenuesMutation, useUpdateMenuesMutation, useDeleteMenuesMutation} = menuesApiSlice;