import IssueModal from '../pages/IssueModal';
import { faker } from '@faker-js/faker';

// ------------ Variables ------------ //

// for views
const confirmWindow = '[data-testid="modal:confirm"]';
const createIssueModal = '[data-testid="modal:issue-details"]';
const backlogList = '[data-testid="list-issue"]';
const backlog = '[data-testid="board-list:backlog"]';

// for buttons
const trashButton = '[data-testid="icon:trash"]';
const closeIssueButton = '[data-testid="icon:close"]';
const createIssueButton = '[data-testid="icon:plus"]';

// for text
const randomWord = faker.word.noun();
const randomWords = faker.word.words(5);
let issueTitle = 'This is an issue of type: Task.';
let deletedIssueTitle = 'This is an issue of type: Task.';
const deleteText = 'Are you sure you want to delete this issue?';
const deleteMessage = "Once you delete, it's gone for good";

// ------------ Functions ------------ //

// for views
const getConfirmWindow = () => cy.get(confirmWindow);
const getCreateIssueModal = () => cy.get(createIssueModal);
const getBacklogList = () => cy.get(backlogList);
const getBacklog = () => cy.get(backlog);

// for buttons
const getTrashButton = () => cy.get(trashButton);
const getCloseIssueButton = () => cy.get(closeIssueButton);
const getCreateIssueButton = () => cy.get(createIssueButton);

// actions with assertions
const clickOnTrashButtonAndAssert = () => {
  getTrashButton().should('be.visible').click();
};

const assertConfirmationWindowData = (text, message) => {
  return getConfirmWindow()
    .should('be.visible')
    .within(() => {
      cy.contains(text).should('exist');
      cy.contains(message).should('exist');
      cy.contains('Delete issue').should('exist');
      cy.contains('Cancel').should('exist');
    });
};

function deleteIssue() {
  cy.get('button').contains('Delete issue').should('be.visible').click();
}

function assertBacklogAfterDel(expectedAmountIssues, title) {
  cy.wait(6000);
  cy.reload();

  getConfirmWindow().should('not.exist');
  getCreateIssueModal().should('not.exist');

  cy.get('div').should('contain', 'Kanban board');

  getBacklog()
    .should('be.visible')
    .and('have.length', 1)
    .within(() => {
      getBacklogList().should('have.length', expectedAmountIssues);
    });
  getBacklogList().contains(title).should('not.exist');
}

function cancelDeletionAndAssert(title) {
  getConfirmWindow()
    .should('be.visible')
    .within(() => {
      cy.get('button').contains('Cancel').should('be.visible').click();
    });

  cy.wait(6000);

  getCreateIssueModal().should('be.visible').and('contain', title);
}

function assertBacklogAfterCancelDeletion(expectedAmountIssues, title) {
  cy.get('div').should('contain', 'Kanban board');

  getBacklog()
    .should('be.visible')
    .and('have.length', 1)
    .within(() => {
      getBacklogList()
        .should('have.length', expectedAmountIssues)
        .contains(title);
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
        getCreateIssueModal().should('be.visible');
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
    getCloseIssueButton().first().should('be.visible').click();
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
        getCreateIssueButton().click();
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

    getBacklog().within(() => {
      getBacklogList().first().find('p').contains(randomWord).click();
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

    getBacklog().within(() => {
      getBacklogList().first().find('p').contains(randomWord).click();
    });

    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData(deleteText, deleteMessage);
    cancelDeletionAndAssert(randomWord);
    getCloseIssueButton().first().should('be.visible').click();
    assertBacklogAfterCancelDeletion(5, randomWord);
  });
});
