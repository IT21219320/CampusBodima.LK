import { apiSlice } from "./apiSlice";

const Ingredient_URL = '/api/ingredients';

export const ingredientsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addIngredient: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/add`,
                method: 'POST',
                body: data,
            }),
        }),
        addKitchenUser: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/add/manager`,
                method: 'POST',
                body: data,
            }),
        }),
        getBoardingIngredients: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/ingredients`,
                method: 'POST',
                body: data
            }),
        }),
        getIngredientHistoy: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/history`,
                method: 'POST',
                body: data
            }),
        }),
        getBoardingIngredientNames: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/ingredients/names`,
                method: 'POST',
                body: data
            }),
        }),
        getKitchenUsersEmails: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/manager/ingredients/emails`,
                method: 'POST',
                body: data
            }),
        }),
        increaseIngredientQuantity: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/ingredients/increase`,
                method: 'POST',
                body: data
            }),
        }),
        reduceIngredientQuantity: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/ingredients/reduce`,
                method: 'POST',
                body: data
            }),
        }),
        getOwnerBoarding: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/${data}`,
                method: 'GET',
            }),
        }),
        getManagerBoarding: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/manager/${data}`,
                method: 'GET',
            }),
        }),
        getBoardingManager: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/kitchen/${data}`,
                method: 'GET',
            }),
        }),
        updateKitchenUser: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/manager`,
                method: 'PUT',
                body: data,
            }),
        }),
        updateIngredients: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner`,
                method: 'PUT',
                body: data,
            }),
        }),
        getUpdateIngredients: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/update/${data}`,
                method: 'GET',
            }),
        }),
        deleteIngredients: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/${data}`,
                method: 'DELETE',
            }),
        }),
        deleteKitchenUser: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/manager/${data}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useAddIngredientMutation,useAddKitchenUserMutation, useGetBoardingIngredientsMutation,useGetBoardingManagerMutation,useGetIngredientHistoyMutation,useIncreaseIngredientQuantityMutation,useReduceIngredientQuantityMutation,useGetBoardingIngredientNamesMutation,useGetKitchenUsersEmailsMutation, useGetManagerBoardingMutation,useGetOwnerBoardingMutation, useUpdateIngredientsMutation,useUpdateKitchenUserMutation,useGetUpdateIngredientsMutation, useDeleteIngredientsMutation,useDeleteKitchenUserMutation} = ingredientsApiSlice;