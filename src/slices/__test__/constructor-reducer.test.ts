import { expect, test, describe } from '@jest/globals';
import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredientDown,
  moveIngredientUp,
  constructorInitialState
} from '../constructor-slice';
import type { constructorState } from '../constructor-slice';
import { nanoid } from '@reduxjs/toolkit';
import { TConstructorIngredient } from '@utils-types';

jest.mock('@reduxjs/toolkit', () => ({
  ...jest.requireActual('@reduxjs/toolkit'),
  nanoid: jest.fn(() => 'mockedID')
}));

describe('Burger constructor slice', () => {
  let baseState: constructorState;

  beforeEach(() => {
    baseState = JSON.parse(JSON.stringify(constructorInitialState));
    baseState.constructorItems = {
      bun: {
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
        image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
        id: '0'
      },
      ingredients: [
        {
          _id: '643d69a5c3f7b9001cfa0942',
          name: 'Соус Spicy-X',
          type: 'sauce',
          proteins: 30,
          fat: 20,
          carbohydrates: 40,
          calories: 30,
          price: 90,
          image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
          image_mobile:
              'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
          image_large:
              'https://code.s3.yandex.net/react/code/sauce-02-large.png',
          id: '1'
        },
        {
          _id: '643d69a5c3f7b9001cfa0941',
          name: 'Биокотлета из марсианской Магнолии',
          type: 'main',
          proteins: 420,
          fat: 142,
          carbohydrates: 242,
          calories: 4242,
          price: 424,
          image: 'https://code.s3.yandex.net/react/code/meat-01.png',
          image_mobile:
              'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
          image_large:
              'https://code.s3.yandex.net/react/code/meat-01-large.png',
          id: '2'
        }
      ]
    };
  });

  test('should add new ingredient with generated id', () => {
    const newIngredient = {
      _id: '643d69a5c3f7b9001cfa093e',
      name: 'Новый ингредиент',
      type: 'main',
      proteins: 10,
      fat: 10,
      carbohydrates: 10,
      calories: 100,
      price: 200,
      image: '',
      image_mobile: '',
      image_large: ''
    };

    const updatedState = constructorReducer(
        baseState,
        addIngredient(newIngredient)
    );

    const added = updatedState.constructorItems.ingredients.find(i => i.id === 'mockedID');

    expect(nanoid).toHaveBeenCalled();
    expect(added).toBeDefined();
    expect(added).toMatchObject({
      ...newIngredient,
      id: 'mockedID'
    });
  });

  test('should remove ingredient by id', () => {
    const initialLength = baseState.constructorItems.ingredients.length;

    const updatedState = constructorReducer(
        baseState,
        removeIngredient('1')
    );

    expect(updatedState.constructorItems.ingredients.length).toBe(initialLength - 1);
    expect(updatedState.constructorItems.ingredients.some(i => i.id === '1')).toBe(false);
  });

  test('should move ingredient up in the list', () => {
    const index = 1;
    const originalFirst = baseState.constructorItems.ingredients[0];
    const originalSecond = baseState.constructorItems.ingredients[1];

    const resultState = constructorReducer(baseState, moveIngredientUp(index));
    const resultIngredients = resultState.constructorItems.ingredients;

    expect(resultIngredients[0]).toEqual(originalSecond);
    expect(resultIngredients[1]).toEqual(originalFirst);
  });

  test('should move ingredient down in the list', () => {
    const index = 0;
    const originalFirst = baseState.constructorItems.ingredients[0];
    const originalSecond = baseState.constructorItems.ingredients[1];

    const resultState = constructorReducer(baseState, moveIngredientDown(index));
    const resultIngredients = resultState.constructorItems.ingredients;

    expect(resultIngredients[0]).toEqual(originalSecond);
    expect(resultIngredients[1]).toEqual(originalFirst);
  });
});
