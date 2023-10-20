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

        getAllFeedbacks: builder.mutation({
            query: () => ({
                url: `${FEEDBACKS_URL}/getfeedback`,
                method: 'GET',
                
                
            }),
        }),

        getFeedbackByUserId: builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/getfeedbackByid`,
                method: 'POST',
                body:data,
                
                
            }),
        }),


        getFeedbackByBoardingId: builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/getfeedbackbyBoardingid`,
                method: 'POST',
                body:data,
                
                
            }),
        }),


        
        updateFeedback: builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/occupant/feedback/update`,
                method: 'PUT',
                body: data,
            }),
        }),

        getUpdateFeedback: builder.mutation({
            query:(data) =>({
                url: `${FEEDBACKS_URL}/occupant/feedback/update/${data}`,
                method: 'Get',
               
            })
,        }),
        deleteFeedback: builder.mutation({
            query: (data) => ({
                url: `${FEEDBACKS_URL}/delete`,
                method: 'DELETE',
                body :data,
               
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
    useGetAllFeedbacksMutation, // Also fix the capitalization here
    useGetFeedbackByUserIdMutation,
    useUpdateFeedbackMutation, // Also fix the capitalization here
    useDeleteFeedbackMutation, // Also fix the capitalization here
    useSearchFeedbackMutation,
    useGetUpdateFeedbackMutation,
    useGetFeedbackByBoardingIdMutation,
  } = feedbackApiSlice;

