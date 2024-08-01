// NB! Tests might have to be ran several times in order to be successful due to time out errors.
// Or it is better to run tests one by one.

import IssueModal from '../pages/IssueModal';
import { faker } from '@faker-js/faker';

// ------- Declaring functions and variables ------ //

const randomWord = faker.word.noun();
const randomWords = faker.word.words(5);

function selectReporterBabyYoda() {
  cy.get('[data-testid="select:reporterId"]').click();
  cy.get('[data-testid="select-option:Baby Yoda"]').click();
}

function selectReporterPickleRick() {
  cy.get('[data-testid="select:reporterId"]').click();
  cy.get('[data-testid="select-option:Pickle Rick"]').click();
}

function selectAssigneePickleRick() {
  cy.get('[data-testid="form-field:userIds"]').click();
  cy.get('[data-testid="select-option:Pickle Rick"]').click();
}

function selectAssigneeLordGaben() {
  cy.get('[data-testid="form-field:userIds"]').click();
  cy.get('[data-testid="select-option:Lord Gaben"]').click();
}

function closedModalAndSuccessMessage() {
  // Assert that modal window is closed and successful message is visible
  cy.get('[data-testid="modal:issue-create"]').should('not.exist');
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
  cy.get('[data-testid="select:type"]')
    .click()
    .then(() => {
      cy.get('[data-testid="select:type"]').then(($element) => {
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

// ------- Test cases ------ //

describe('Issue create', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project/board`)
      .then((url) => {
        // System will already open issue creating modal in beforeEach block
        cy.visit(url + '/board?modal-issue-create=true');
      });
  });

  it('Should create a Story issue and validate it successfully', () => {
    // System finds modal for creating issue and does next steps inside of it
    cy.get('[data-testid="modal:issue-create"]').within(() => {
      // Type value to description input field
      cy.get('.ql-editor')
        .type('TEST_DESCRIPTION')
        .should('have.text', 'TEST_DESCRIPTION');

      // Type value to title input field
      // Order of filling in the fields is first description, then title on purpose
      // Otherwise filling title first sometimes doesn't work due to web page implementation
      cy.get('input[name="title"]')
        .type('TEST_TITLE')
        .should('have.value', 'TEST_TITLE');

      // Open issue type dropdown and choose Story
      cy.get('[data-testid="select:type"]').click();
      cy.get('[data-testid="select-option:Story"]')
        .wait(1000)
        .trigger('mouseover')
        .trigger('click');
      // Here should be cy.get('[data-testid="con:story"]').should('be.visible'); But i gives time out

      // Select Baby Yoda from reporter dropdown
      selectReporterBabyYoda();

      // Select Baby Yoda from assignee dropdown
      selectAssigneePickleRick();

      // Click on button 'Create issue'
      cy.get('button[type="submit"]').click();
    });

    closedModalAndSuccessMessage();
    reloadPageAndNoSuccessMessage();

    // Wait for Backlog list to be visible
    cy.get('[data-testid="board-list:backlog"]', { timeout: 60000 })
      .should('be.visible')
      .and('have.length', 1);

    // Assert than only one list with name Backlog is visible and do steps inside of it
    cy.get('[data-testid="board-list:backlog"]')
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        // Assert that this list contains 5 issues and first element with tag p has specified text
        cy.get('[data-testid="list-issue"]')
          .should('have.length', 5)
          .first()
          .find('p')
          .contains('TEST_TITLE')
          .siblings()
          .within(() => {
            //Assert that correct avatar and type icon are visible
            cy.get('[data-testid="avatar:Pickle Rick"]').should('be.visible');
            cy.get('[data-testid="icon:story"]').should('be.visible');
          });
      });

    cy.get('[data-testid="board-list:backlog"]')
      .contains('TEST_TITLE')
      .within(() => {
        // Assert that correct avatar and type icon are visible
        cy.get('[data-testid="avatar:Pickle Rick"]').should('be.visible');
        cy.get('[data-testid="icon:story"]').should('be.visible');
      });
  });

  it('Should create a Bug issue and validate it successfully', () => {
    cy.get('[data-testid="modal:issue-create"]').within(() => {
      cy.get('.ql-editor').type('My bug description');
      cy.get('.ql-editor').should('have.text', 'My bug description');

      cy.get('input[name="title"]').type('Bug');
      cy.get('input[name="title"]').should('have.value', 'Bug');

      cy.get('[data-testid="select:type"]').click();
      cy.get('[data-testid="select-option:Bug"]')
        .wait(1000)
        .trigger('mouseover')
        .trigger('click');
      // Here should be cy.get('[data-testid="con:bug"]').should('be.visible'); But i gives time out

      selectReporterPickleRick();
      selectAssigneeLordGaben();

      cy.get('[data-testid="select:priority"]').click();
      cy.get('[data-testid="select-option:Highest"]')
        .wait(1000)
        .trigger('mouseover')
        .trigger('click');

      cy.get('button[type="submit"]').click();
    });

    closedModalAndSuccessMessage();
    reloadPageAndNoSuccessMessage();

    // Wait for Backlog list to be visible.
    cy.get('[data-testid="board-list:backlog"]', { timeout: 60000 })
      .should('be.visible')
      .and('have.length', 1);

    cy.get('[data-testid="board-list:backlog"]')
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        // Assert that this list contains 5 issues and first element with tag p has specified text
        cy.get('[data-testid="list-issue"]')
          .should('have.length', 5)
          .first()
          .find('p')
          .contains('Bug')
          .siblings()
          .within(() => {
            //Assert that correct avatar and type icon are visible
            cy.get('[data-testid="avatar:Lord Gaben"]').should('be.visible');
            cy.get('[data-testid="icon:arrow-up"]').should('be.visible');
            cy.get('[data-testid="icon:bug"]').should('be.visible');
          });
      });

    cy.get('[data-testid="board-list:backlog"]')
      .contains('Bug')
      .within(() => {
        // Assert that correct avatar and type icon are visible
        cy.get('[data-testid="avatar:Lord Gaben"]').should('be.visible');
        cy.get('[data-testid="icon:arrow-up"]').should('be.visible');
        cy.get('[data-testid="icon:bug"]').should('be.visible');
      });
  });

  it('Should create a Task issue using random data and validate it successfully', () => {
    cy.get('[data-testid="modal:issue-create"]').within(() => {
      cy.get('.ql-editor').type(randomWords);
      cy.get('.ql-editor').should('have.text', randomWords);

      cy.get('input[name="title"]').type(randomWord);
      cy.get('input[name="title"]').should('have.value', randomWord);

      selectReporterBabyYoda();

      cy.get('[data-testid="select:priority"]').click();
      cy.get('[data-testid="select-option:Low"]')
        .wait(1000)
        .trigger('mouseover')
        .trigger('click');

      cy.get('button[type="submit"]').click();
    });

    closedModalAndSuccessMessage();
    reloadPageAndNoSuccessMessage();

    // Wait for Backlog list to be visible
    cy.get('[data-testid="board-list:backlog"]', { timeout: 60000 })
      .should('be.visible')
      .and('have.length', 1);

    cy.get('[data-testid="board-list:backlog"]')
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        // Assert that this list contains 5 issues and first element with tag p has specified text
        cy.get('[data-testid="list-issue"]')
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

    cy.get('[data-testid="board-list:backlog"]')
      .contains(randomWord)
      .within(() => {
        // Assert that correct avatar and type icon are visible
        cy.get('[data-testid="icon:arrow-down"]').should('be.visible');
        cy.get('[data-testid="icon:task"]').should('be.visible');
      });
  });

  it('Should create a Bug issue using fillIssueDataAndAssert function and validate it successfully', () => {
    const description = randomWords;
    const title = randomWord;
    const issueType = 'Bug';
    const priority = 'Low';

    cy.get('[data-testid="modal:issue-create"]').within(() => {
      fillIssueDataAndAssert(description, title, issueType, priority);
      cy.get('button[type="submit"]').click();
    });

    closedModalAndSuccessMessage();
    reloadPageAndNoSuccessMessage();

    // Wait for Backlog list to be visible
    cy.get('[data-testid="board-list:backlog"]', { timeout: 60000 })
      .should('be.visible')
      .and('have.length', 1);

    cy.get('[data-testid="board-list:backlog"]')
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        // Assert that this list contains 5 issues and first element with tag p has specified text
        cy.get('[data-testid="list-issue"]')
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

    cy.get('[data-testid="board-list:backlog"]')
      .contains(randomWord)
      .within(() => {
        // Assert that correct avatar and type icon are visible
        cy.get('[data-testid="icon:arrow-down"]').should('be.visible');
        cy.get('[data-testid="icon:bug"]').should('be.visible');
      });
  });

  it('Should validate title is required field if missing', () => {
    // System finds modal for creating issue and does next steps inside of it
    cy.get('[data-testid="modal:issue-create"]').within(() => {
      // Try to click create issue button without filling any data
      cy.get('button[type="submit"]').click();

      // Assert that correct error message is visible
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
