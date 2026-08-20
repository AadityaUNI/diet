import type { HydratedMeals, PlanEditorDraft } from "@/types/plan-editor";

export const empty_draft: PlanEditorDraft = {id: 1, name: "", meals: []};
export const expected_empty = {hydrated_meals: [], total_macros: { total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0, total_fibre: 0 }};


export const general_draft: PlanEditorDraft = {
    id: 10, 
    name: "General", 
    meals: [{
        id: 1, 
        name: "",
        ingredients: [{
            amount: 100, 
            name: "apple", 
            calories: 100, 
            protein: 100, 
            carbs: 100, 
            fat: 100, 
            fibre: 100,
            id: 0
        }, {
            amount: 0, 
            name: "", 
            calories: 100, 
            protein: 100, 
            carbs: 100, 
            fat: 100, 
            fibre: 100,
            id: 1
        }]
    }, 
    {
        id: 2, 
        name: "",
        ingredients: [{
            amount: 50, 
            name: "mango", 
            calories: 50.6, 
            protein: 10.6, 
            carbs: 0, 
            fat: 0, 
            fibre: 0,
            id: 0
        }, {
            amount: 50.5, 
            name: "", 
            calories: 100, 
            protein: 100, 
            carbs: 100, 
            fat: 100, 
            fibre: 100,
            id: 1
        }]
    }
    ]
}

export const expected_general = 
{
  hydrated_meals: [
    {
      id: 1,
      name: "",
      ingredients: [
        {
          amount: 100,
          name: "apple",
          calories: 100,
          protein: 100,
          carbs: 100,
          fat: 100,
          fibre: 100,
          id: 0
        },
        {
          amount: 0,
          name: "",
          calories: 100,
          protein: 100,
          carbs: 100,
          fat: 100,
          fibre: 100,
          id: 1
        }
      ],
      total_calories: 100,
      total_protein: 100,
      total_carbs: 100,
      total_fats: 100,
      total_fibre: 100
    },
    {
      id: 2,
      name: "",
      ingredients: [
        {
          amount: 50,
          name: "mango",
          calories: 50.6,
          protein: 10.6,
          carbs: 0,
          fat: 0,
          fibre: 0,
          id: 0
        },
        {
          amount: 50.5,
          name: "",
          calories: 100,
          protein: 100,
          carbs: 100,
          fat: 100,
          fibre: 100,
          id: 1
        }
      ],
      total_calories: 75.8,
      total_protein: 55.8,
      total_carbs: 50.5,
      total_fats: 50.5,
      total_fibre: 50.5
    }
  ],
  total_macros: {
    total_calories: 175.8,
    total_protein: 155.8,
    total_carbs: 150.5,
    total_fats: 150.5,
    total_fibre: 150.5
  }
};