/// <reference types="cypress" />

import { deleteCookie, setCookie } from '../../../src/utils/cookie';

const API_BASE = 'https://norma.nomoreparties.space/api';

describe('Burger Constructor Suite', () => {
  beforeEach(() => {
    // Устанавливаем токены
    setCookie('accessToken', 'Bearer test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');

    // Подменяем ответы API
    cy.intercept('GET', `${API_BASE}/auth/user`, { fixture: 'user.json' }).as('getUserApi');
    cy.intercept('GET', `${API_BASE}/ingredients`, { fixture: 'ingredients.json' }).as('getIngredientsApi');

    // Открываем страницу приложения
    cy.visit('/');
    cy.wait('@getUserApi');
    cy.wait('@getIngredientsApi');
  });

  afterEach(() => {
    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  });

  it('should display available buns and fillings', () => {
    // Проверяем, что список булок содержит первый элемент
    cy.get('[data-cy="Булки"] button').eq(0).should('be.visible').click();
    cy.get('[data-cy="Начинки"] button').eq(0).should('be.visible').click();

    // Проверяем, что выбранные ингредиенты отображаются в конструкторе
    cy.get('[data-cy="constructor"]').should('contain.text', 'Краторная булка N-200i')
        .and('contain.text', 'Биокотлета из марсианской Магнолии');
  });

  it('should open and close ingredient details modal', () => {
    // Открываем модалку первого ингредиента
    cy.get('[data-cy="ingredient-item"]').first().click();
    cy.get('[data-cy="modal"]').as('detailModal').should('be.visible')
        .and('contain', 'Краторная булка N-200i');

    // Закрываем через крестик
    cy.get('[data-cy="modal-close"]').click();
    cy.get('@detailModal').should('not.exist');

    // Повторно открываем и закрываем по оверлею
    cy.get('[data-cy="ingredient-item"]').first().click();
    cy.get('@detailModal').should('exist');
    cy.get('[data-cy="modal-overlay"]').click({ force: true });
    cy.get('@detailModal').should('not.exist');
  });

  it('should create an order and display order number', () => {
    // Подменяем POST запрос создания заказа
    cy.intercept('POST', `${API_BASE}/orders`, { fixture: 'order.json' }).as('postOrderApi');

    // Добавляем булку и начинку
    cy.get('[data-cy="Булки"] button').first().click();
    cy.get('[data-cy="Начинки"] button').first().click();

    // Кликаем по кнопке оформить заказ
    cy.get('[data-cy="constructor"] button').contains(/Оформить/i).click();

    // Проверяем номер заказа в модальном окне
    cy.get('[data-cy="modal"]').should('be.visible')
        .and('contain.text', '66666');

    // Закрываем модалку и убеждаемся, что конструктор очищен
    cy.get('[data-cy="modal-close"]').click();
    cy.get('[data-cy="constructor"]').should('not.contain', 'Краторная булка N-200i')
        .and('not.contain', 'Биокотлета из марсианской Магнолии');

    cy.wait('@postOrderApi');
  });
});
