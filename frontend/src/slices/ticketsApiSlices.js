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

        //search handler
        searchTicket:builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/search`,
                method:'POST',
                body: data,
            }), 
        }),

        updateTicketStatus:builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/updateStatus`,
                method:'PUT',
                body: data,
            }), 
        }),
        getTicketByUniqueId:builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/${data}`,
                method:'GET',
            }), 
        }),
    }),
});

export const{
    useCreateTicketMutation,
    useGetUserTicketsMutation,
    useUpdateTicketStatusMutation,
    useGetTicketByUniqueIdMutation,
    useSearchTicketMutation,
} = ticketsApiSlice