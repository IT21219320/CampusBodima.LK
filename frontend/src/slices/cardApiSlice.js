import id from "date-fns/locale/id";
import { apiSlice } from "./apiSlice";

const CARD_URL = '/api/cards';

export const cardApiSlice = apiSlice.injectEndpoints({
    endpoints:(builder) => ({
        addCard: builder.mutation({
            query:(data) => ({
                url: `${CARD_URL}/addCard`,
                method: 'POST',
                body: data,
            }),
        }),
        getCardByUser: builder.mutation({
            query:(data) => ({
                url: `${CARD_URL}/getCard`,
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useAddCardMutation,useGetCardByUserMutation } = cardApiSlice;