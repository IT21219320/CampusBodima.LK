// ordersApiSlice.js
import { apiSlice } from "./apiSlice";
const ORDER_URL = "api/orders"; 

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDER_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    getOrder: builder.query({
      query: (data) => ({
        url: `${ORDER_URL}/get`,
        method: "GET",
        body: data,
      }),
    }),
    updateOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDER_URL}/update/${data.id}`, // Add order ID here
        method: "PUT",
        body: data,
      }),
    }),
    deleteOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDER_URL}/delete/${data.id}`, // Add order ID here
        method: "DELETE",
      }),
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrderQuery, useUpdateOrderMutation, useDeleteOrderMutation } = ordersApiSlice;
