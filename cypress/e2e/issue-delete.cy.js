// ------------ Variables ------------ //

// for views
const confirmWindow = '[data-testid="modal:confirm"]';
const issueWindow = '[data-testid="modal:issue-details"]';
const kanbanBoard = '[class="sc-elJkPf kpQKrj"]';
const backlogList = '[data-testid="list-issue"]';
const backlog = '[data-testid="board-list:backlog"]';

// for buttons
const trashButton = '[data-testid="icon:trash"]';
const deleteIssueButton = 'button[class="sc-bwzfXH dIxFno sc-kGXeez bLOzZQ"]';
const cancelButton = 'button[class="sc-bwzfXH ewzfNn sc-kGXeez bLOzZQ"]';
const closeIssueModal = '[class="sc-bdVaJa fuyACr"]';

// for text
const issueTitle = 'This is an issue of type: Task.';
const deletedIssueTitle = 'This is an issue of type: Task.';
const deleteText = 'Are you sure you want to delete this issue?';
const deleteMessage = "Once you delete, it's gone for good";

// ------------ Functions ------------ //

function clickOnTrashButtonAndAssert() {
  // Click on trash button and assert that new confirmation window opens
  cy.get(trashButton).should('be.visible').click();
  cy.get(confirmWindow).should('be.visible');
}

function assertConfirmationWindowData() {
  // Assert deletion text and button visibility on confirmation window
  cy.get(confirmWindow)
    .should('contain', deleteText)
    .and('contain', deleteMessage)
    .and('contain', 'Delete issue')
    .and('contain', 'Cancel');
}

function deleteIssueAndAssert() {
  // Click on Delete issue button on confirmation window
  // Reload page
  // Assert that confirmation window is closed
  // Assert that issue window is closed
  // Assert user is back on Kanban board and deleted issue is not visible
  // Assert number of issues in the backlog list is decreased by one
  cy.get(deleteIssueButton).should('be.visible').click();
  cy.wait(6000);
  cy.reload();

  cy.get(confirmWindow).should('not.exist');
  cy.get(issueWindow).should('not.exist');

  cy.get(kanbanBoard).should('be.visible').and('contain', 'Kanban board');

  cy.get(backlog)
    .should('be.visible')
    .and('have.length', 1)
    .within(() => {
      cy.get(backlogList).should('have.length', 3);
    });
  cy.get(backlogList).contains(deletedIssueTitle).should('not.exist');
}

function cancelDeletionAndAssert() {
  // Click on Cancel button on confirmation window
  // Assert user is back on current issue window
  cy.get(cancelButton).should('be.visible').click();
  cy.wait(6000);

  cy.get(issueWindow).should('be.visible').and('contain', issueTitle);
}

function assertionAfterCancelDeletion() {
  // Assert issue is still on Kanban board
  // Assert that number of issues in the backlog list is the same
  cy.get(kanbanBoard).should('be.visible').and('contain', 'Kanban board');

  cy.get(backlog)
    .should('be.visible')
    .and('have.length', 1)
    .within(() => {
      cy.get(backlogList).should('have.length', 4).contains(issueTitle);
    });
}

// ------------ Test cases ------------ //

describe('Issue delete', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project`)
      .then((url) => {
        cy.visit(url + '/board');
        cy.contains(issueTitle).click();
        cy.get(issueWindow).should('be.visible');
        cy.get('textarea[placeholder="Short summary"]').should(
          'have.text',
          issueTitle
        );
      });
  });

  it('Should delete issue TASK-2481685 and validate it successfully', () => {
    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData();
    deleteIssueAndAssert();
  });

  it('Should NOT delete issue if user cancels its deletion and validate it successfully', () => {
    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData();
    cancelDeletionAndAssert();
    cy.get(closeIssueModal).should('be.visible').click();
    assertionAfterCancelDeletion();
  });
});
