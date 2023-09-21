import { apiSlice } from "./apiSlice";

const FEEDBACKS_URL = '/api/feedback';

export const feedbackApiSlice = apiSlice.injectEndpoints({

    endpoints: (builder) => ({
        createFeedback: builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/create`,
                method:'POST',
                body: data,
            }),
        }),

        getFeedbackById: builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/getfeedback`,
                method: 'POST',
                body: data,
                
            }),
        }),
        updateFeedback: builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/update`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteFeedback: builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/delete/${data}`,
                method: 'DELETE',
           }),
        }),

        searchFeedback:builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/search`,
                method:'POST',
                body: data,
            })
        })
    })
});
export const {
    useCreateFeedbackMutation, // Fix the capitalization here
    useGetFeedbackByIdMutation, // Also fix the capitalization here
    useUpdateFeedbackMutation, // Also fix the capitalization here
    useDeleteFeedbackMutation, // Also fix the capitalization here
    useSearchFeedbackMutation,
  } = feedbackApiSlice;

