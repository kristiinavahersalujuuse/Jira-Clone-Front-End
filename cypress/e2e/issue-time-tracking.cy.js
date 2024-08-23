/* --------------- ATTENTION -----------------
NB! NB! NB! NB! NB! NB! NB! NB! NB! NB! NB! NB! NB! NB! NB! 
Tests might have to be ran several times in order to be successful due to time out errors.
TIME OUT ERRORS might occur for:
1) '[data-testid="modal:issue-details"]' OR
2) cy.visit('/'); OR
3) getEstimatedTimeField()
      .clear()
      .wait(6000)
      .should('have.value', '')
      .and('have.attr', 'placeholder', 'Number'); 
4) AND MORE :( Just be patient! If there is an error - RUN IT AGAIN !!!!
*/

import { faker } from '@faker-js/faker';

// ------------> Variables <------------ //

// ---> to create and open Issue

// text
const randomWord = faker.word.noun();
const randomWords = faker.word.words(5);
const issueDescription = randomWords;
const issueTitle = randomWord;
const successMessage = 'Issue has been successfully created.';

// dropdown menu
const issueType = '[data-testid="select:type"]';
const assigneeName = '[data-testid="form-field:userIds"]';

// modals
const backlogList = '[data-testid="board-list:backlog"]';
const issueCreate = '[data-testid="modal:issue-create"]';
const issueDetailsModal = '[data-testid="modal:issue-details"]';

// fields
const issueDescriptionField = '.ql-editor';
const issueTitleField = 'input[name="title"]';

// buttons
const buttonSubmit = 'button[type="submit"]';
const createIssueButton = '[data-testid="icon:plus"]';
const closeIssueButton = '[data-testid="icon:close"]';

// ---> to track Time

// text
const noTimeLoggedText = 'No time logged';
const estRandomTime = faker.number.int({ min: 1, max: 10 });
const newRandomTime = faker.number.int({ min: 11, max: 20 });

// fields
const stopWatchIcon = '[data-testid="icon:stopwatch"]';
const estimatedTimeField = 'input[placeholder="Number"]';

// modals
const timeTrackingModal = '[data-testid="modal:tracking"]';

// buttons
const saveTimeTrackButton = 'button';

// ------------> Functions <------------ //

// ---> fun to create, open and close Issue
const getDescription = () => cy.get(issueDescriptionField);
const getIssueTitle = () => cy.get(issueTitleField);
const getIssueType = () => cy.get(issueType);
const getAssigneeName = () => cy.get(assigneeName);
const getIssueCreate = () => cy.get(issueCreate);
const getSuccessMessage = () => cy.contains(successMessage);
const getSubmitButton = () => cy.get(buttonSubmit);
const getCreateIssueButton = () => cy.get(createIssueButton);
const getIssueDetailsModal = () => cy.get(issueDetailsModal);
const getTimetrackingModal = () => cy.get(timeTrackingModal);

const fillIssueTitleAndDescription = (issueTitle, issueDescription) => {
  getDescription().type(issueDescription).should('have.text', issueDescription);
  getIssueTitle().type(issueTitle).should('have.value', issueTitle);
};

const chooseIssueType = (issueType) => {
  getIssueType().click();
  cy.get(`[data-testid="select-option:${issueType}"]`)
    .wait(1000)
    .trigger('mouseover')
    .trigger('click');
};

const chooseAssignee = (assignee) => {
  getAssigneeName().click();
  cy.get(`[data-testid="select-option:${assignee}"]`).click();
};

const checkForSuccessMessage = () => {
  getIssueCreate().should('not.exist');
  getSuccessMessage().should('be.visible');
};

const reloadBacklogAndAssert = () => {
  cy.reload();
  getSuccessMessage().should('not.exist');
};

const createNewIssue = (issueTitle, issueDescription) => {
  getIssueCreate().within(() => {
    fillIssueTitleAndDescription(issueTitle, issueDescription);
    chooseIssueType('Story');
    chooseAssignee('Pickle Rick');
    getSubmitButton().click();
  });
};

const openIssue = () => {
  cy.get(backlogList).within(() => {
    cy.get('[data-testid="list-issue"]')
      .first()
      .find('p')
      .contains(issueTitle)
      .click({ force: true })
      .wait(6000);
  });
};

const closeIssue = () => {
  getIssueDetailsModal().within(() => {
    cy.get(closeIssueButton).first().scrollIntoView().click();
  });
};

const openNewlyCreatedIssue = () => {
  getCreateIssueButton().click();
  createNewIssue(issueTitle, issueDescription);
  checkForSuccessMessage();
  reloadBacklogAndAssert();
  openIssue();
};

// ---> fun to track Time
const getStopWatchIcon = () => cy.get(stopWatchIcon);
const getEstimatedTimeField = () => cy.get(estimatedTimeField);
const getSpentTimeField = () => cy.get(estimatedTimeField);
const getRemainingTimeField = () => cy.get(estimatedTimeField);
const getSaveTimeTrackButton = () => cy.get(saveTimeTrackButton);

const closeTimeTrackModal = () => {
  getTimetrackingModal().within(() => {
    getSaveTimeTrackButton().click();
  });
};

const openTimeTrackModal = () => {
  getStopWatchIcon().click();
};

const verifyNoTimeIsLogged = () => {
  getStopWatchIcon().next().children().should('contain', noTimeLoggedText);
};

const verifyEstimatedTimeIsEpmty = () => {
  getIssueDetailsModal().within(() => {
    getEstimatedTimeField()
      .should('have.value', '')
      .and('have.attr', 'placeholder', 'Number');
  });
};

const addEstimatedTime = (hours) => {
  getEstimatedTimeField().should('exist').type(hours).wait(1000);
};

const verifyEstimatedTimeField = (hours) => {
  getEstimatedTimeField().should('have.value', `${hours}`);
};

const verifyEstimatedTime = (hours) => {
  getStopWatchIcon().next().children().should('contain', `${hours}h estimated`);
};

const verifyLoggedTime = (hours) => {
  getStopWatchIcon().next().children().should('not.contain', noTimeLoggedText);
  getStopWatchIcon().next().children().should('contain', `${hours}h logged`);
};

const changeEstimatedTime = (hours) => {
  getEstimatedTimeField().clear().type(hours).should('be.visible');
};

const addEstTimeAndVerify = (hours) => {
  getIssueDetailsModal().within(() => {
    verifyNoTimeIsLogged();
    addEstimatedTime(hours);
    verifyEstimatedTime(hours);
  });
};

const changeEstTimeAndVerify = (hours) => {
  getIssueDetailsModal().within(() => {
    changeEstimatedTime(hours);
    verifyEstimatedTime(hours);
  });
};

const removeEstTimeAndVerify = () => {
  getEstimatedTimeField()
    .clear()
    .wait(6000)
    .should('have.value', '')
    .and('have.attr', 'placeholder', 'Number');
};

const fillTimeTrackingFieldsAndVerify = (spentTime, remainingTime) => {
  getSpentTimeField()
    .first()
    .clear()
    .type(spentTime)
    .should('have.value', spentTime)
    .then(() => {
      getStopWatchIcon()
        .next()
        .children()
        .should('contain', `${spentTime}h logged`);
    });

  getRemainingTimeField()
    .last()
    .clear()
    .type(remainingTime)
    .should('have.value', remainingTime)
    .then(() => {
      getStopWatchIcon()
        .next()
        .children()
        .should('contain', `${remainingTime}h remaining`);
    });
};

const removeTimeTrackingFieldsAndVerify = (hours) => {
  getSpentTimeField()
    .first()
    .clear()
    .should('have.value', '')
    .then(() => {
      getStopWatchIcon().next().children().should('contain', noTimeLoggedText);
    });

  getRemainingTimeField()
    .last()
    .clear()
    .should('have.value', '')
    .then(() => {
      getStopWatchIcon()
        .next()
        .children()
        .should('contain', `${hours}h estimated`);
    });
};

const addSpentAndRemainingTime = (hours, spentTime, remainingTime) => {
  getTimetrackingModal()
    .should('exist')
    .within(() => {
      getStopWatchIcon(hours)
        .next()
        .children()
        .should('contain', noTimeLoggedText)
        .and('contain', `${hours}h estimated`);

      fillTimeTrackingFieldsAndVerify(spentTime, remainingTime);
    });
};

// ---------> Test cases for time estimation  <--------- //

describe('Time estimation functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project`)
      .then((url) => {
        cy.visit(url + '/board');
        openNewlyCreatedIssue();
      });
  });

  it('Should add, edit and remove time estimation of an issue and verify', () => {
    // Add estimation
    addEstTimeAndVerify(estRandomTime);

    closeIssue();
    openIssue();
    verifyEstimatedTime(estRandomTime);
    verifyEstimatedTimeField(estRandomTime);

    // Edit estimation
    changeEstTimeAndVerify(newRandomTime);

    closeIssue();
    openIssue();
    verifyEstimatedTime(newRandomTime);
    verifyEstimatedTimeField(newRandomTime);

    closeIssue();
    openIssue();

    // Remove estimation
    removeEstTimeAndVerify();

    closeIssue();
    openIssue();
    verifyEstimatedTimeIsEpmty();
  });
});

// ---------> Test cases for time logging <--------- //
describe('Time logging functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project`)
      .then((url) => {
        cy.visit(url + '/board');
        openNewlyCreatedIssue();
        addEstTimeAndVerify(estRandomTime);
      });
  });

  const spentTime = 2;
  const remainingTime = 5;
  const newSpentTime = 10;
  const newRemainingTime = 15;

  it('Should add, edit and remove spent and remaining time in Time Tracking to recently created issue', () => {
    // Add time
    openTimeTrackModal();
    addSpentAndRemainingTime(estRandomTime, spentTime, remainingTime);
    closeTimeTrackModal();
    verifyLoggedTime(spentTime);
    verifyEstimatedTimeField(estRandomTime);

    // Edit time
    openTimeTrackModal();
    getTimetrackingModal().within(() => {
      fillTimeTrackingFieldsAndVerify(newSpentTime, newRemainingTime);
    });
    closeTimeTrackModal();
    verifyLoggedTime(newSpentTime);
    verifyEstimatedTimeField(estRandomTime);

    // Remove time
    openTimeTrackModal();
    getTimetrackingModal().within(() => {
      removeTimeTrackingFieldsAndVerify(estRandomTime);
    });
    closeTimeTrackModal();
    verifyNoTimeIsLogged();
    verifyEstimatedTimeField(estRandomTime);
  });
});
