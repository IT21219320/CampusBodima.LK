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
        replyTicket:builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/reply`,
                method:'PUT',
                body: data,
            }), 
        }),

        deleteTicket:builder.mutation({
            query: (data) =>({
                url: `${TICKETS_URL}/delete/${data}`,
                method: 'DELETE',
            }),
        }),

        updateTicket:builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/update`,
                method:'PUT',
                body: data,
            }), 
        }),

        //owner
        getOwnerTickets: builder.mutation({
            query: (data) => ({
                url: `${TICKETS_URL}/getOwnerTickets`,
                method: 'POST',
                body: data,
            }),
        }),

    }),
});

export const{
    useCreateTicketMutation,
    useGetUserTicketsMutation,
    useUpdateTicketStatusMutation,
    useGetTicketByUniqueIdMutation,
    useReplyTicketMutation,
    useDeleteTicketMutation,
    useUpdateTicketMutation,
    useGetOwnerTicketsMutation,
    useSearchTicketMutation,
} = ticketsApiSlice