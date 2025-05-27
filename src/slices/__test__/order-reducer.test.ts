import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import orderReducer, { getOrderThunk } from '../order-slice';

const initializeStore = () =>
    configureStore({
      reducer: {
        order: orderReducer
      }
    });

describe('Редьюсер заказа — orderSlice', () => {
  describe('Обработка getOrderThunk', () => {
    test('Установка состояния загрузки при инициализации запроса', () => {
      const store = initializeStore();
      store.dispatch({ type: getOrderThunk.pending.type });

      const orderState = store.getState().order;
      expect(orderState.isLoading).toBe(true);
      expect(orderState.error).toBeNull();
    });

    test('Установка ошибки при отклонённом запросе', () => {
      const store = initializeStore();
      const mockErrorMessage = 'Что-то пошло не так';

      store.dispatch({
        type: getOrderThunk.rejected.type,
        error: { message: mockErrorMessage }
      });

      const orderState = store.getState().order;
      expect(orderState.isLoading).toBe(false);
      expect(orderState.error).toBe(mockErrorMessage);
    });

    test('Обновление состояния при успешном получении заказа', () => {
      const mockOrderData = {
        orders: [
          {
            _id: '660e81bb97ede0001d0643eb',
            ingredients: [
              '643d69a5c3f7b9001cfa0943',
              '643d69a5c3f7b9001cfa0943',
              '643d69a5c3f7b9001cfa0943',
              '643d69a5c3f7b9001cfa0943',
              '643d69a5c3f7b9001cfa0943',
              '643d69a5c3f7b9001cfa0943',
              '643d69a5c3f7b9001cfa0943',
              '643d69a5c3f7b9001cfa0943',
              '643d69a5c3f7b9001cfa093d'
            ],
            owner: '65db1c0a97ede0001d05e2d6',
            status: 'done',
            name: 'Space флюоресцентный бургер',
            createdAt: '2024-04-04T10:32:27.595Z',
            updatedAt: '2024-04-04T10:32:28.181Z',
            number: 37596
          }
        ]
      };

      const store = initializeStore();
      store.dispatch({
        type: getOrderThunk.fulfilled.type,
        payload: mockOrderData
      });

      const orderState = store.getState().order;
      expect(orderState.isLoading).toBe(false);
      expect(orderState.error).toBeNull();
      expect(orderState.order).toEqual(mockOrderData.orders[0]);
    });
  });
});
