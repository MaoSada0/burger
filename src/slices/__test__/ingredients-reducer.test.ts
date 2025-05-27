import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer, { getIngredientsThunk } from '../ingredients-slice';

const createTestStore = () =>
    configureStore({
      reducer: {
        ingredients: ingredientsReducer
      }
    });

describe('Состояние ингредиентов в store', () => {
  describe('Асинхронный thunk getIngredientsThunk', () => {
    test('Состояние при инициации загрузки ингредиентов', () => {
      const store = createTestStore();
      store.dispatch({ type: getIngredientsThunk.pending.type });
      const state = store.getState().ingredients;

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('Состояние при ошибке загрузки ингредиентов', () => {
      const store = createTestStore();
      const simulatedError = 'Ошибка получения данных';
      store.dispatch({
        type: getIngredientsThunk.rejected.type,
        error: { message: simulatedError }
      });

      const state = store.getState().ingredients;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(simulatedError);
    });

    test('Состояние при успешной загрузке ингредиентов', () => {
      const mockIngredients = [
        {
          _id: '643d69a5c3f7b9001cfa093c',
          name: 'Краторная булка N-200i',
          type: 'bun',
          proteins: 80,
          fat: 24,
          carbohydrates: 53,
          calories: 420,
          price: 1255,
          image: 'https://code.s3.yandex.net/react/code/bun-02.png',
          image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
        }
      ];

      const store = createTestStore();
      store.dispatch({
        type: getIngredientsThunk.fulfilled.type,
        payload: mockIngredients
      });

      const state = store.getState().ingredients;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.ingredients).toEqual(mockIngredients);
    });
  });
});
