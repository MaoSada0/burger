import { expect, test, describe, beforeEach, jest } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  loginUserThunk,
  registerUserThunk,
  logoutUserThunk,
  updateUserThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  getUserThunk,
  clearUserError,
} from '../user-slice';

// Mock cookie utilities
jest.mock('../../utils/cookie', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

describe('User slice thunks', () => {
  // Helper to create a fresh store instance
  const setupStore = () =>
      configureStore({
        reducer: { user: userReducer },
      });

  // Typed store variable
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    store = setupStore();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  describe('loginUserThunk', () => {
    test('pending action sets loading true and clears error', () => {
      store.dispatch({ type: loginUserThunk.pending.type });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(true);
      expect(state.error).toBeNull();
    });

    test('rejected action sets loading false and stores error', () => {
      const message = 'Network error';
      store.dispatch({ type: loginUserThunk.rejected.type, error: { message } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBe(message);
    });

    test('fulfilled action updates user, tokens, and auth status', () => {
      const payload = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        user: { email: 'test@example.com', name: 'Test User' },
      };
      store.dispatch({ type: loginUserThunk.fulfilled.type, payload });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(payload.user);
      expect(state.isAuthorized).toBe(true);
      const { setCookie } = require('../../utils/cookie');
      expect(setCookie).toHaveBeenCalledWith('accessToken', payload.accessToken);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('refreshToken', payload.refreshToken);
    });
  });

  describe('registerUserThunk', () => {
    test('pending action sets loading true and clears error', () => {
      store.dispatch({ type: registerUserThunk.pending.type });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(true);
      expect(state.error).toBeNull();
    });

    test('rejected action sets loading false and stores error', () => {
      const message = 'Email exists';
      store.dispatch({ type: registerUserThunk.rejected.type, error: { message } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBe(message);
    });

    test('fulfilled action updates user, tokens, and auth status', () => {
      const payload = {
        accessToken: 'tokenABC',
        refreshToken: 'refreshABC',
        user: { email: 'new@example.com', name: 'New User' },
      };
      store.dispatch({ type: registerUserThunk.fulfilled.type, payload });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(payload.user);
      expect(state.isAuthorized).toBe(true);
    });
  });

  describe('logoutUserThunk', () => {
    test('pending action sets loading true and clears error', () => {
      store.dispatch({ type: logoutUserThunk.pending.type });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(true);
      expect(state.error).toBeNull();
    });

    test('rejected action sets loading false and stores error', () => {
      const message = 'Logout failed';
      store.dispatch({ type: logoutUserThunk.rejected.type, error: { message } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBe(message);
    });

    test('fulfilled action clears user and tokens, resets auth', () => {
      store.dispatch({ type: logoutUserThunk.fulfilled.type, payload: { message: 'OK' } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthorized).toBe(false);
      const { deleteCookie } = require('../../utils/cookie');
      expect(deleteCookie).toHaveBeenCalledWith('accessToken');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('updateUserThunk', () => {
    test('pending action sets loading true and clears error', () => {
      store.dispatch({ type: updateUserThunk.pending.type });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(true);
      expect(state.error).toBeNull();
    });

    test('rejected action sets loading false and stores error', () => {
      const message = 'Update failed';
      store.dispatch({ type: updateUserThunk.rejected.type, error: { message } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBe(message);
    });

    test('fulfilled action updates user and keeps auth', () => {
      const payload = { user: { email: 'upd@example.com', name: 'Updated User' } };
      store.dispatch({ type: updateUserThunk.fulfilled.type, payload });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(payload.user);
      expect(state.isAuthorized).toBe(true);
    });
  });

  describe('forgotPasswordThunk', () => {
    test('pending action sets loading true and clears error', () => {
      store.dispatch({ type: forgotPasswordThunk.pending.type });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(true);
      expect(state.error).toBeNull();
    });

    test('rejected action sets loading false and stores error', () => {
      const message = 'Email not found';
      store.dispatch({ type: forgotPasswordThunk.rejected.type, error: { message } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBe(message);
    });

    test('fulfilled action clears loading and error without auth', () => {
      store.dispatch({ type: forgotPasswordThunk.fulfilled.type, payload: { message: 'Sent' } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthorized).toBe(false);
    });
  });

  describe('resetPasswordThunk', () => {
    test('pending action sets loading true and clears error', () => {
      store.dispatch({ type: resetPasswordThunk.pending.type });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(true);
      expect(state.error).toBeNull();
    });

    test('rejected action sets loading false and stores error', () => {
      const message = 'Token invalid';
      store.dispatch({ type: resetPasswordThunk.rejected.type, error: { message } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBe(message);
    });

    test('fulfilled action clears loading and error without auth', () => {
      store.dispatch({ type: resetPasswordThunk.fulfilled.type, payload: { message: 'Reset OK' } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthorized).toBe(false);
    });
  });

  describe('getUserThunk', () => {
    test('pending action sets loading true and clears error', () => {
      store.dispatch({ type: getUserThunk.pending.type });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(true);
      expect(state.error).toBeNull();
    });

    test('rejected action sets loading false and stores error', () => {
      const message = 'Fetch failed';
      store.dispatch({ type: getUserThunk.rejected.type, error: { message } });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBe(message);
    });

    test('fulfilled action sets user and auth', () => {
      const payload = { user: { email: 'get@example.com', name: 'Getter' } };
      store.dispatch({ type: getUserThunk.fulfilled.type, payload });
      const state = store.getState().user;
      expect(state.isLoadong).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(payload.user);
      expect(state.isAuthorized).toBe(true);
    });
  });

  describe('clearUserError reducer', () => {
    test('clears existing error message', () => {
      store.dispatch({ type: loginUserThunk.rejected.type, error: { message: 'Err' } });
      store.dispatch(clearUserError());
      const state = store.getState().user;
      expect(state.error).toBeNull();
    });
  });
});
