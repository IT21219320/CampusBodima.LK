import { apiSlice } from "./apiSlice";

const ORDER_URL = '/api/orders';

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (data) => ({
                url: `${ORDER_URL}/createOrder`,
                method: 'POST',
                body: data,
            }),
        }),
        getOrder: builder.mutation({
            query: (data) => ({
                url: `${ORDER_URL}/getOrder`,
                method: 'GET',
                body:data,
            }),
        }),
        updateOrder: builder.mutation({
            query: (data) => ({
                url: `${ORDER_URL}/updateOrder`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteOrder: builder.mutation({
            query: (data) => ({
                url: `${ORDER_URL}/deleteOrder/${data}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useAddMenuMutation, useGetOwnerMenuesMutation, useUpdateMenuesMutation, useDeleteMenuesMutation} = menuesApiSlice;