// ordersApiSlice.js
import { apiSlice } from "./apiSlice";
const ORDER_URL = "/api/orders"; 

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDER_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    getOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDER_URL}/get`,
        method: "POST",
        body: data,
      }),
    }),
    updateOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDER_URL}/update/${data.id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDER_URL}/delete`, 
        method: "DELETE",
        body:data,
      }),
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrderMutation, useUpdateOrderMutation, useDeleteOrderMutation } = ordersApiSlice;
