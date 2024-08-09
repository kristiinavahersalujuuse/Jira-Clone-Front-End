import IssueModal from '../pages/IssueModal';
import { faker } from '@faker-js/faker';

// ------------ Variables ------------ //

// for views
const confirmWindow = () => cy.get('[data-testid="modal:confirm"]');
const createIssueModal = () => cy.get('[data-testid="modal:issue-details"]');
const backlogList = () => cy.get('[data-testid="list-issue"]');
const backlog = () => cy.get('[data-testid="board-list:backlog"]');

// for buttons
const trashButton = () => cy.get('[data-testid="icon:trash"]');
const closeIssueButton = () => cy.get('[data-testid="icon:close"]');
const createIssueButton = () => cy.get('[data-testid="icon:plus"]');

// for text
const randomWord = faker.word.noun();
const randomWords = faker.word.words(5);
let issueTitle = 'This is an issue of type: Task.';
let deletedIssueTitle = 'This is an issue of type: Task.';
const deleteText = 'Are you sure you want to delete this issue?';
const deleteMessage = "Once you delete, it's gone for good";

// ------------ Functions ------------ //

function clickOnTrashButtonAndAssert() {
  trashButton().should('be.visible').click();
}

function assertConfirmationWindowData(text, message) {
  confirmWindow().should('be.visible');
  confirmWindow().within(() => {
    cy.contains(text);
    cy.contains(message);
    cy.contains('Delete issue');
    cy.contains('Cancel');
  });
}

function deleteIssue() {
  cy.get('button').contains('Delete issue').should('be.visible').click();
}

function assertBacklogAfterDel(expectedAmountIssues, title) {
  cy.wait(6000);
  cy.reload();

  confirmWindow().should('not.exist');
  createIssueModal().should('not.exist');

  cy.get('div').should('contain', 'Kanban board');

  backlog()
    .should('be.visible')
    .and('have.length', 1)
    .within(() => {
      backlogList().should('have.length', expectedAmountIssues);
    });
  backlogList().contains(title).should('not.exist');
}

function cancelDeletionAndAssert(title) {
  confirmWindow()
    .should('be.visible')
    .within(() => {
      cy.get('button').contains('Cancel').should('be.visible').click();
    });

  cy.wait(6000);

  createIssueModal().should('be.visible').and('contain', title);
}

function assertBacklogAfterCancelDeletion(expectedAmountIssues, title) {
  cy.get('div').should('contain', 'Kanban board');

  backlog()
    .should('be.visible')
    .and('have.length', 1)
    .within(() => {
      backlogList().should('have.length', expectedAmountIssues).contains(title);
    });
}

// ------------ Test cases ------------ //

describe('Existing issue delete', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project`)
      .then((url) => {
        cy.visit(url + '/board');
        cy.contains(issueTitle).click();
        createIssueModal().should('be.visible');
        cy.get('textarea[placeholder="Short summary"]').should(
          'have.text',
          issueTitle
        );
      });
  });

  it('Should delete existing issue TASK-2481685 and validate it successfully', () => {
    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData(deleteText, deleteMessage);
    deleteIssue();
    assertBacklogAfterDel(3, deletedIssueTitle);
  });

  it('Should NOT delete existing issue if user cancels its deletion and validate it successfully', () => {
    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData(deleteText, deleteMessage);
    cancelDeletionAndAssert(issueTitle);
    closeIssueButton().first().should('be.visible').click();
    assertBacklogAfterCancelDeletion(4, issueTitle);
  });
});

describe('Newly created issue delete', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project`)
      .then((url) => {
        cy.visit(url + '/board');
        createIssueButton().click();
      });
  });

  const expectedAmountIssues = 5;

  it('Should delete newly created issue and validate it successfully', () => {
    const issueDetails = {
      title: randomWord,
      type: 'Bug',
      description: randomWords,
      assignee: 'Lord Gaben',
    };

    IssueModal.createIssue(issueDetails);
    IssueModal.ensureIssueIsCreated(expectedAmountIssues, issueDetails);

    backlog().within(() => {
      backlogList().first().find('p').contains(randomWord).click();
    });

    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData(deleteText, deleteMessage);
    deleteIssue();
    assertBacklogAfterDel(4, randomWord);
  });

  it('Should NOT delete newly created issue if user cancels its deletion and validate it successfully', () => {
    const issueDetails = {
      title: randomWord,
      type: 'Story',
      description: randomWords,
      assignee: 'Baby Yoda',
    };

    IssueModal.createIssue(issueDetails);
    IssueModal.ensureIssueIsCreated(expectedAmountIssues, issueDetails);

    backlog().within(() => {
      backlogList().first().find('p').contains(randomWord).click();
    });

    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData(deleteText, deleteMessage);
    cancelDeletionAndAssert(randomWord);
    closeIssueButton().first().should('be.visible').click();
    assertBacklogAfterCancelDeletion(5, randomWord);
  });
});
