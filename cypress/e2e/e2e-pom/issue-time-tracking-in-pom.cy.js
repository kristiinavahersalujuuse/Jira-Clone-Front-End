/* --------------- ATTENTION -----------------
add this (issue-time-tracking-in-pom.cy.js) file to 'e2e-pom' folder and
   IssueTimeTracking.js file to 'pages' folder 
   */
/* 
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

import IssueTimeTracking from '../../pages/IssueTimeTracking';
import { faker } from '@faker-js/faker';

// ------------> Variables <------------ //

const randomWord = faker.word.noun();
const randomWords = faker.word.words(5);
const issueDescription = randomWords;
const issueTitle = randomWord;

const estRandomTime = faker.number.int({ min: 1, max: 10 });
const newRandomTime = faker.number.int({ min: 11, max: 20 });

const spentTime = 2;
const remainingTime = 5;
const newSpentTime = 10;
const newRemainingTime = 15;

// ---------> Test cases for time estimation  <--------- //

describe('Time estimation functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project`)
      .then((url) => {
        cy.visit(url + '/board');
        IssueTimeTracking.openNewlyCreatedIssue(issueTitle, issueDescription);
      });
  });

  it('Should add, edit and remove time estimation of an issue and verify', () => {
    // Add estimation
    IssueTimeTracking.addEstTimeAndVerify(estRandomTime);

    IssueTimeTracking.closeIssue();
    IssueTimeTracking.openIssue();
    IssueTimeTracking.verifyEstimatedTime(estRandomTime);
    IssueTimeTracking.verifyEstimatedTimeField(estRandomTime);

    // Edit estimation
    IssueTimeTracking.changeEstTimeAndVerify(newRandomTime);

    IssueTimeTracking.closeIssue();
    IssueTimeTracking.openIssue();
    IssueTimeTracking.verifyEstimatedTime(newRandomTime);
    IssueTimeTracking.verifyEstimatedTimeField(newRandomTime);

    IssueTimeTracking.closeIssue();
    IssueTimeTracking.openIssue();

    // Remove estimation
    IssueTimeTracking.removeEstTimeAndVerify();

    IssueTimeTracking.closeIssue();
    IssueTimeTracking.openIssue();
    IssueTimeTracking.verifyEstimatedTimeIsEpmty();
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
        IssueTimeTracking.openNewlyCreatedIssue(issueTitle, issueDescription);
        IssueTimeTracking.addEstTimeAndVerify(estRandomTime);
      });
  });

  it('Should add, edit and remove spent and remaining time in Time Tracking to recently created issue', () => {
    // Add time
    IssueTimeTracking.openTimeTrackModal();
    IssueTimeTracking.addSpentAndRemainingTime(
      estRandomTime,
      spentTime,
      remainingTime
    );

    IssueTimeTracking.closeTimeTrackModal();
    IssueTimeTracking.verifyLoggedTime(spentTime);
    IssueTimeTracking.verifyEstimatedTimeField(estRandomTime);

    // Edit time
    IssueTimeTracking.openTimeTrackModal();
    IssueTimeTracking.getTimetrackingModal().within(() => {
      IssueTimeTracking.fillTimeTrackingFieldsAndVerify(
        newSpentTime,
        newRemainingTime
      );
    });

    IssueTimeTracking.closeTimeTrackModal();
    IssueTimeTracking.verifyLoggedTime(newSpentTime);
    IssueTimeTracking.verifyEstimatedTimeField(estRandomTime);

    // Remove time
    IssueTimeTracking.openTimeTrackModal();
    IssueTimeTracking.getTimetrackingModal().within(() => {
      IssueTimeTracking.removeTimeTrackingFieldsAndVerify(estRandomTime);
    });

    IssueTimeTracking.closeTimeTrackModal();
    IssueTimeTracking.verifyNoTimeIsLogged();
    IssueTimeTracking.verifyEstimatedTimeField(estRandomTime);
  });
});
