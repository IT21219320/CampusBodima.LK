import { apiSlice } from "./apiSlice";

const USERS_URL = '/api/users';

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}`,
                method: 'POST',
                body: data,
            }),
        }),
        verifyEmail: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/`,
                method: 'GET',
                params: data
            }),
        }),
        login: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth`,
                method: 'POST',
                body: data,
            }),
        }),
        googleLogin: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/googleAuth`,
                method: 'POST',
                body: data,
            }),
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: data,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/logout`,
                method: 'POST',
            }),
        }),
        generateOTP: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/generateOTP`,
                method: 'POST',
                body: data,
            }),
        }),
        verifyOTP: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/verifyOTP`,
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/resetPassword`,
                method: 'POST',
                body: data,
            }),
        })
    }),
});

export const { useLoginMutation, useGoogleLoginMutation, useRegisterMutation, useVerifyEmailMutation, useLogoutMutation, useUpdateUserMutation, useGenerateOTPMutation, useVerifyOTPMutation, useResetPasswordMutation } = usersApiSlice;