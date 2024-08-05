/**
 * This is an example file and approach for POM in Cypress
 */

/* In order to run this code succesfully add following function to IssueModal.js file

ensureNrOfIssuesAfterDel(expectedAmountIssues, issueTitle) {
    cy.get(this.backlogList)
      .should('be.visible')
      .and('have.length', '1')
      .within(() => {
        cy.get(this.issuesList).should('have.length', expectedAmountIssues);
      });
    cy.get(this.backlogList).contains(issueTitle).should('not.exist');
  }

*/

import IssueModal from '../../pages/IssueModal';

// Variables
const issueTitle = 'This is an issue of type: Task.';
const expectedAmountIssues = 3;
let isVisible = false;

describe('Issue delete', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project/board`)
      .then((url) => {
        //open issue detail modal with title from line 16
        cy.contains(issueTitle).click();
      });
  });

  it('Should delete issue successfully', () => {
    IssueModal.clickDeleteButton();
    IssueModal.confirmDeletion();
    IssueModal.validateIssueVisibilityState(issueTitle, isVisible);
    IssueModal.ensureNrOfIssuesAfterDel(expectedAmountIssues, issueTitle);
  });

  it('Should cancel deletion process successfully', () => {
    IssueModal.clickDeleteButton();
    IssueModal.cancelDeletion();
    IssueModal.closeDetailModal();
    IssueModal.ensureIssueIsVisibleOnBoard(issueTitle);
  });
});
