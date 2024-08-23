// practicing functions

import { faker } from '@faker-js/faker';

// ------------ Variables ------------ //

// buttons
const deleteCommentButton = 'Delete comment';
const deleteButton = 'Delete';
const editCommentButton = 'Edit';
const saveCommentButton = 'Save';

// text
let issueTitle = 'This is an issue of type: Task.';
let comment = 'TEST_COMMENT';
let previousComment = 'An old silent pond...';
const randomComment = faker.lorem.sentence(20);

// views and field
const issueDetailsModal = '[data-testid="modal:issue-details"]';
const existingComment = '[data-testid="issue-comment"]';
const confirmDelModal = '[data-testid="modal:confirm"]';
const addCommentArea = 'textarea[placeholder="Add a comment..."]';
const addCommentText = 'Add a comment...';

// ------------ Functions ------------ //

// single action:

const getIssueDetailsModal = () => cy.get(issueDetailsModal);
const getAddComment = () => cy.get(addCommentArea);
const getAddCommentArea = () => cy.get(addCommentArea);
const getAddCommentText = () => cy.contains(addCommentText);
const getExistingComment = () => cy.get(existingComment);
const getSaveCommentButton = () => cy.contains('button', saveCommentButton);
const getConfirmDelModal = () => cy.get(confirmDelModal);

// multiple actions:

const addNewComment = (comment) => {
  getIssueDetailsModal().within(() => {
    getAddCommentText().click();
    getAddComment().type(comment);
    getSaveCommentButton().click().should('not.exist');
    getAddCommentText().should('exist');
    getExistingComment().should('contain', comment);
  });
};

const editExitingComment = (previousComment, comment) => {
  getIssueDetailsModal().within(() => {
    getExistingComment().first().contains('Edit').click().should('not.exist');
    getAddCommentArea()
      .should('contain', previousComment)
      .clear()
      .type(comment);
    getSaveCommentButton().click().should('not.exist');
    getExistingComment()
      .should('contain', editCommentButton)
      .and('contain', comment);
  });
};

const deleteExistingComment = (comment) => {
  getIssueDetailsModal().find(existingComment).contains(deleteButton).click();

  getConfirmDelModal().within(() => {
    cy.contains('button', deleteCommentButton).click().should('not.exist');
  });

  getIssueDetailsModal().find(comment).should('not.exist');
};

// ------------ Test cases ------------ //

describe('Issue comments creating, editing and deleting', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project/board`)
      .then((url) => {
        cy.visit(url + '/board');
        cy.contains(issueTitle).click();
      });
  });

  it('Should create a comment successfully', () => {
    addNewComment(comment);
  });

  it('Should edit a comment successfully', () => {
    comment = 'TEST_COMMENT_EDITED';

    editExitingComment(previousComment, comment);
  });

  it('Should delete a comment successfully', () => {
    deleteExistingComment(comment);
  });

  it('Should create, edit and delete a comment', () => {
    addNewComment(randomComment);
    editExitingComment(randomComment, 'This is a test');
    deleteExistingComment('This is a test');
  });
});
