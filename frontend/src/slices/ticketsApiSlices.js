import { apiSlice } from "./apiSlice";
const TICKETS_URL = '/api/tickets';

export const ticketsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createTicket: builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/create`,
                method:'POST',
                body: data,
            }),
        }),

        getUserTickets: builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/getUserTickets`,
                method: 'POST',
                body: data,
            }),
        }),

        searchTicket:builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/search`,
                method:'POST',
                body: data,
            }), 
        })
    }),
});

export const{
    useCreateTicketMutation,
    useGetUserTicketsMutation,
    useSearchTicketMutation,
} = ticketsApiSlice