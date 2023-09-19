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
        getBoardingIngredients: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/${data}`,
                method: 'GET',
            }),
        }),
        getOwnerBoarding: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/${data}`,
                method: 'GET',
            }),
        }),
        updateIngredients: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteIngredients: builder.mutation({
            query: (data) => ({
                url: `${Ingredient_URL}/owner/${data}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useAddIngredientMutation, useGetBoardingIngredientsMutation, useGetOwnerBoardingMutation, useUpdateIngredientsMutation, useDeleteIngredientsMutation} = ingredientsApiSlice;