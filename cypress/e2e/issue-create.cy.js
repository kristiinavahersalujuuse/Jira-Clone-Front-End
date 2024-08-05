// NB! Tests might have to be ran several times in order to be successful due to time out errors.

import IssueModal from '../pages/IssueModal';
import { faker } from '@faker-js/faker';

// ------------ Variables ------------ //

// for text
const randomWord = faker.word.noun();
const randomWords = faker.word.words(5);
const issueTitle = 'TEST_TITLE';
const storyDescription = 'TEST_DESCRIPTION';
const bugDescription = 'My bug description';

// for dropdown menu
const selectType = '[data-testid="select:type"]';
const selectPriority = '[data-testid="select:priority"]';
const selectReporter = '[data-testid="select:reporterId"]';
const selectAssignee = '[data-testid="form-field:userIds"]';

// for views
const listBacklog = '[data-testid="board-list:backlog"]';
const listIssue = '[data-testid="list-issue"]';

// for buttons
const buttonSubmit = 'button[type="submit"]';
const buttonCreateIssue = '[data-testid="modal:issue-create"]';

// ------------ Functions ------------ //

function selectReporterBabyYoda() {
  cy.get(selectReporter).click();
  cy.get('[data-testid="select-option:Baby Yoda"]').click();
}

function selectReporterPickleRick() {
  cy.get(selectReporter).click();
  cy.get('[data-testid="select-option:Pickle Rick"]').click();
}

function selectAssigneePickleRick() {
  cy.get(selectAssignee).click();
  cy.get('[data-testid="select-option:Pickle Rick"]').click();
}

function selectAssigneeLordGaben() {
  cy.get(selectAssignee).click();
  cy.get('[data-testid="select-option:Lord Gaben"]').click();
}

function closedModalAndSuccessMessage() {
  // Assert that modal window is closed and successful message is visible
  cy.get(buttonCreateIssue).should('not.exist');
  cy.contains('Issue has been successfully created.').should('be.visible');
}

function reloadPageAndNoSuccessMessage() {
  // Reload the page to be able to see recently created issue
  // Assert that successful message has dissappeared after the reload
  cy.reload();
  cy.contains('Issue has been successfully created.').should('not.exist');
}

function fillIssueDataAndAssert(description, title, issueType, priority) {
  // Description
  cy.get('.ql-editor').type(description).should('have.text', description);

  // Title
  cy.get('input[name="title"]').type(title).should('have.value', title);

  // Issue Type
  cy.get(selectType)
    .click()
    .then(() => {
      cy.get(selectType).then(($element) => {
        if ($element.text() == issueType) {
          cy.get('label').contains('Issue Type').click();
        } else {
          cy.get(`[data-testid="select-option:${issueType}"]`).click();
        }
      });
    });
  cy.get('[data-testid="select:type"] div').should('contain', issueType);

  // Reporter
  selectReporterPickleRick();

  // Assignee
  selectAssigneeLordGaben();

  // Priority
  cy.get('[data-testid="select:priority"]')
    .click()
    .then(() => {
      cy.get('[data-testid="select:priority"]').then(($element) => {
        if ($element.text() == priority) {
          cy.get('label').contains('Priority').click();
        } else {
          cy.get(`[data-testid="select-option:${priority}"]`).click();
        }
      });
    });
  cy.get('[data-testid="select:priority"] div').should('contain', priority);
}

// ------------ Test cases ------------ //

describe('Issue create', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project/board`)
      .then((url) => {
        cy.visit(url + '/board?modal-issue-create=true');
      });
  });

  it('Should create a Story issue and validate it successfully', () => {
    cy.get(buttonCreateIssue).within(() => {
      cy.get('.ql-editor')
        .type(storyDescription)
        .should('have.text', storyDescription);

      // Order of filling in the fields is first description, then title on purpose
      // Otherwise filling title first sometimes doesn't work due to web page implementation
      cy.get('input[name="title"]')
        .type(issueTitle)
        .should('have.value', issueTitle);

      cy.get(selectType).click();
      cy.get('[data-testid="select-option:Story"]')
        .wait(1000)
        .trigger('mouseover')
        .trigger('click');
      cy.get('[data-testid="icon:story"]').should('be.visible');

      selectReporterBabyYoda();
      selectAssigneePickleRick();

      cy.get(buttonSubmit).click();
    });

    closedModalAndSuccessMessage();
    reloadPageAndNoSuccessMessage();

    // Wait for Backlog list to be visible
    cy.get(listBacklog, { timeout: 60000 })
      .should('be.visible')
      .and('have.length', 1);

    cy.get(listBacklog)
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        cy.get(listIssue)
          .should('have.length', 5)
          .first()
          .find('p')
          .contains(issueTitle)
          .siblings()
          .within(() => {
            cy.get('[data-testid="avatar:Pickle Rick"]').should('be.visible');
            cy.get('[data-testid="icon:story"]').should('be.visible');
          });
      });

    cy.get(listBacklog)
      .contains(issueTitle)
      .within(() => {
        cy.get('[data-testid="avatar:Pickle Rick"]').should('be.visible');
        cy.get('[data-testid="icon:story"]').should('be.visible');
      });
  });

  it('Should create a Bug issue and validate it successfully', () => {
    cy.get(buttonCreateIssue).within(() => {
      cy.get('.ql-editor').type(bugDescription);
      cy.get('.ql-editor').should('have.text', bugDescription);

      cy.get('input[name="title"]').type('Bug');
      cy.get('input[name="title"]').should('have.value', 'Bug');

      cy.get(selectType).click();
      cy.get('[data-testid="select-option:Bug"]')
        .wait(1000)
        .trigger('mouseover')
        .trigger('click');
      cy.get('[data-testid="icon:bug"]').should('be.visible');

      selectReporterPickleRick();
      selectAssigneeLordGaben();

      cy.get(selectPriority).click();
      cy.get('[data-testid="select-option:Highest"]')
        .wait(1000)
        .trigger('mouseover')
        .trigger('click');

      cy.get(buttonSubmit).click();
    });

    closedModalAndSuccessMessage();
    reloadPageAndNoSuccessMessage();

    // Wait for Backlog list to be visible.
    cy.get(listBacklog, { timeout: 60000 })
      .should('be.visible')
      .and('have.length', 1);

    cy.get(listBacklog)
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        cy.get(listIssue)
          .should('have.length', 5)
          .first()
          .find('p')
          .contains('Bug')
          .siblings()
          .within(() => {
            cy.get('[data-testid="avatar:Lord Gaben"]').should('be.visible');
            cy.get('[data-testid="icon:arrow-up"]').should('be.visible');
            cy.get('[data-testid="icon:bug"]').should('be.visible');
          });
      });

    cy.get(listBacklog)
      .contains('Bug')
      .within(() => {
        cy.get('[data-testid="avatar:Lord Gaben"]').should('be.visible');
        cy.get('[data-testid="icon:arrow-up"]').should('be.visible');
        cy.get('[data-testid="icon:bug"]').should('be.visible');
      });
  });

  it('Should create a Task issue using random data and validate it successfully', () => {
    cy.get(buttonCreateIssue).within(() => {
      cy.get('.ql-editor').type(randomWords);
      cy.get('.ql-editor').should('have.text', randomWords);

      cy.get('input[name="title"]').type(randomWord);
      cy.get('input[name="title"]').should('have.value', randomWord);

      selectReporterBabyYoda();

      cy.get(selectPriority).click();
      cy.get('[data-testid="select-option:Low"]')
        .wait(1000)
        .trigger('mouseover')
        .trigger('click');

      cy.get(buttonSubmit).click();
    });

    closedModalAndSuccessMessage();
    reloadPageAndNoSuccessMessage();

    cy.get(listBacklog, { timeout: 60000 })
      .should('be.visible')
      .and('have.length', 1);

    cy.get(listBacklog)
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        cy.get(listIssue)
          .should('have.length', 5)
          .first()
          .find('p')
          .contains(randomWord)
          .siblings()
          .within(() => {
            cy.get('[data-testid="icon:arrow-down"]').should('be.visible');
            cy.get('[data-testid="icon:task"]').should('be.visible');
          });
      });

    cy.get(listBacklog)
      .contains(randomWord)
      .within(() => {
        cy.get('[data-testid="icon:arrow-down"]').should('be.visible');
        cy.get('[data-testid="icon:task"]').should('be.visible');
      });
  });

  it('Should create a Bug issue using fillIssueDataAndAssert function and validate it successfully', () => {
    const description = randomWords;
    const title = randomWord;
    const issueType = 'Bug';
    const priority = 'Low';

    cy.get(buttonCreateIssue).within(() => {
      fillIssueDataAndAssert(description, title, issueType, priority);
      cy.get(buttonSubmit).click();
    });

    closedModalAndSuccessMessage();
    reloadPageAndNoSuccessMessage();

    // Wait for Backlog list to be visible
    cy.get(listBacklog, { timeout: 60000 })
      .should('be.visible')
      .and('have.length', 1);

    cy.get(listBacklog)
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        cy.get(listIssue)
          .should('have.length', 5)
          .first()
          .find('p')
          .contains(randomWord)
          .siblings()
          .within(() => {
            cy.get('[data-testid="icon:arrow-down"]').should('be.visible');
            cy.get('[data-testid="icon:bug"]').should('be.visible');
          });
      });

    cy.get(listBacklog)
      .contains(randomWord)
      .within(() => {
        cy.get('[data-testid="icon:arrow-down"]').should('be.visible');
        cy.get('[data-testid="icon:bug"]').should('be.visible');
      });
  });

  it('Should validate title is required field if missing', () => {
    cy.get(buttonCreateIssue).within(() => {
      cy.get(buttonSubmit).click();

      cy.get('[data-testid="form-field:title"]').should(
        'contain',
        'This field is required'
      );
    });
  });

  it('Should not add issue to backlog when user cancels its creation', () => {
    const title = 'Issue will be cancelled';
    const description = randomWords;
    const assigneeName = 'Lord Gaben';

    // Using partially POM method
    IssueModal.getIssueModal();
    IssueModal.editDescription(description);
    IssueModal.editTitle(title);
    IssueModal.selectAssignee(assigneeName);
    cy.get('button[type="button"]').last().click();
  });
});
