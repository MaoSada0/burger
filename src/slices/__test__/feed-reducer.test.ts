import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import feedReducer, { getFeedThunk, getOrdersThunk } from '../feed-slice';

const initializeStore = () =>
    configureStore({
      reducer: { feed: feedReducer }
    });

describe('Редьюсер ленты заказов', () => {
  describe('Обработка getFeedThunk', () => {
    test('Устанавливает загрузку при отправке запроса', () => {
      const store = initializeStore();
      store.dispatch({ type: getFeedThunk.pending.type });
      const state = store.getState().feed;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('Устанавливает ошибку при отклонении запроса', () => {
      const store = initializeStore();
      const mockError = 'network issue';
      store.dispatch({
        type: getFeedThunk.rejected.type,
        error: { message: mockError }
      });
      const state = store.getState().feed;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });

    test('Сохраняет данные после успешного ответа', () => {
      const mockResponse = {
        orders: [
          {
            _id: 'order123',
            ingredients: ['id1', 'id2'],
            status: 'done',
            name: 'Mock Burger',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T01:00:00Z',
            number: 1000
          }
        ],
        total: 5000,
        totalToday: 150
      };

      const store = initializeStore();
      store.dispatch({
        type: getFeedThunk.fulfilled.type,
        payload: mockResponse
      });

      const state = store.getState().feed;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.orders).toEqual(mockResponse.orders);
      expect(state.total).toBe(mockResponse.total);
      expect(state.totalToday).toBe(mockResponse.totalToday);
    });
  });

  describe('Обработка getOrdersThunk (лентa пользователя)', () => {
    test('Флаг загрузки устанавливается при запросе', () => {
      const store = initializeStore();
      store.dispatch({ type: getOrdersThunk.pending.type });
      const state = store.getState().feed;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('Сохраняется сообщение об ошибке при неудаче', () => {
      const store = initializeStore();
      const simulatedError = 'fetch failed';
      store.dispatch({
        type: getOrdersThunk.rejected.type,
        error: { message: simulatedError }
      });
      const state = store.getState().feed;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(simulatedError);
    });

    test('Сохраняет список заказов пользователя при успехе', () => {
      const mockOrders = [
        {
          _id: 'order987',
          ingredients: ['id3', 'id4'],
          status: 'pending',
          name: 'Test Burger',
          createdAt: '2024-04-04T10:16:19.376Z',
          updatedAt: '2024-04-04T10:16:19.994Z',
          number: 9999
        }
      ];

      const store = initializeStore();
      store.dispatch({
        type: getOrdersThunk.fulfilled.type,
        payload: mockOrders
      });

      const state = store.getState().feed;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.orders).toEqual(mockOrders);
    });
  });
});
