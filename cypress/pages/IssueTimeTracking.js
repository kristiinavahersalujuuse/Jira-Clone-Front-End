class IssueTimeTracking {
  constructor() {
    // ---> to create and open Issue
    // text
    this.successMessage = 'Issue has been successfully created.';

    // dropdown menu
    this.issueType = '[data-testid="select:type"]';
    this.assigneeName = '[data-testid="form-field:userIds"]';
    // modals
    this.backlogList = '[data-testid="board-list:backlog"]';
    this.issueCreate = '[data-testid="modal:issue-create"]';
    this.issueDetailsModal = '[data-testid="modal:issue-details"]';
    // fields
    this.issueDescriptionField = '.ql-editor';
    this.issueTitleField = 'input[name="title"]';
    // buttons
    this.buttonSubmit = 'button[type="submit"]';
    this.createIssueButton = '[data-testid="icon:plus"]';
    this.closeIssueButton = '[data-testid="icon:close"]';

    // ---> to track Time
    // text
    this.noTimeLoggedText = 'No time logged';
    // fields
    this.stopWatchIcon = '[data-testid="icon:stopwatch"]';
    this.estimatedTimeField = 'input[placeholder="Number"]';
    // modals
    this.timeTrackingModal = '[data-testid="modal:tracking"]';
    // buttons
    this.saveTimeTrackButton = 'button';
  }

  // Actions to create, open and close Issue
  getDescription() {
    return cy.get(this.issueDescriptionField);
  }
  getIssueTitle() {
    return cy.get(this.issueTitleField);
  }
  getIssueType() {
    return cy.get(this.issueType);
  }
  getAssigneeName() {
    return cy.get(this.assigneeName);
  }
  getIssueCreate() {
    return cy.get(this.issueCreate);
  }
  getSuccessMessage() {
    return cy.contains(this.successMessage);
  }
  getSubmitButton() {
    return cy.get(this.buttonSubmit);
  }
  getCreateIssueButton() {
    return cy.get(this.createIssueButton);
  }
  getIssueDetailsModal() {
    return cy.get(this.issueDetailsModal);
  }
  getTimetrackingModal() {
    return cy.get(this.timeTrackingModal);
  }

  fillIssueTitleAndDescription(issueTitle, issueDescription) {
    this.getDescription()
      .type(issueDescription)
      .should('have.text', issueDescription);
    this.getIssueTitle().type(issueTitle).should('have.value', issueTitle);
  }

  chooseIssueType(issueType) {
    this.getIssueType().click();
    cy.get(`[data-testid="select-option:${issueType}"]`)
      .wait(1000)
      .trigger('mouseover')
      .trigger('click');
  }

  chooseAssignee(assignee) {
    this.getAssigneeName().click();
    cy.get(`[data-testid="select-option:${assignee}"]`).click();
  }

  checkForSuccessMessage() {
    this.getIssueCreate().should('not.exist');
    this.getSuccessMessage().should('be.visible');
  }

  reloadBacklogAndAssert() {
    cy.reload();
    this.getSuccessMessage().should('not.exist');
  }

  createNewIssue(issueTitle, issueDescription) {
    this.getIssueCreate().within(() => {
      this.fillIssueTitleAndDescription(issueTitle, issueDescription);
      this.chooseIssueType('Story');
      this.chooseAssignee('Pickle Rick');
      this.getSubmitButton().click();
    });
  }

  openIssue() {
    cy.get(this.backlogList).within(() => {
      cy.get('[data-testid="list-issue"]')
        .first()
        .find('p')
        // .contains(issueTitle)
        .click({ force: true })
        .wait(6000);
    });
  }

  closeIssue() {
    this.getIssueDetailsModal().within(() => {
      cy.get(this.closeIssueButton).first().scrollIntoView().click();
    });
  }

  openNewlyCreatedIssue(issueTitle, issueDescription) {
    this.getCreateIssueButton().click();
    this.createNewIssue(issueTitle, issueDescription);
    this.checkForSuccessMessage();
    this.reloadBacklogAndAssert();
    this.openIssue();
  }

  // Actions to track Time
  getStopWatchIcon() {
    return cy.get(this.stopWatchIcon);
  }
  getEstimatedTimeField() {
    return cy.get(this.estimatedTimeField);
  }
  getSpentTimeField() {
    return cy.get(this.estimatedTimeField);
  }
  getRemainingTimeField() {
    return cy.get(this.estimatedTimeField);
  }
  getSaveTimeTrackButton() {
    return cy.get(this.saveTimeTrackButton);
  }

  closeTimeTrackModal() {
    this.getTimetrackingModal().within(() => {
      this.getSaveTimeTrackButton().click();
    });
  }

  openTimeTrackModal() {
    this.getStopWatchIcon().click();
  }

  verifyNoTimeIsLogged() {
    this.getStopWatchIcon()
      .next()
      .children()
      .should('contain', this.noTimeLoggedText);
  }

  verifyEstimatedTimeIsEpmty() {
    this.getIssueDetailsModal().within(() => {
      this.getEstimatedTimeField()
        .should('have.value', '')
        .and('have.attr', 'placeholder', 'Number');
    });
  }

  addEstimatedTime(hours) {
    this.getEstimatedTimeField().should('exist').type(hours).wait(1000);
  }

  verifyEstimatedTimeField(hours) {
    this.getEstimatedTimeField().should('have.value', `${hours}`);
  }

  verifyEstimatedTime(hours) {
    this.getStopWatchIcon()
      .next()
      .children()
      .should('contain', `${hours}h estimated`);
  }

  verifyLoggedTime(hours) {
    this.getStopWatchIcon()
      .next()
      .children()
      .should('not.contain', this.noTimeLoggedText);
    this.getStopWatchIcon()
      .next()
      .children()
      .should('contain', `${hours}h logged`);
  }

  changeEstimatedTime(hours) {
    this.getEstimatedTimeField().clear().type(hours).should('be.visible');
  }

  addEstTimeAndVerify(hours) {
    this.getIssueDetailsModal().within(() => {
      this.verifyNoTimeIsLogged();
      this.addEstimatedTime(hours);
      this.verifyEstimatedTime(hours);
    });
  }

  changeEstTimeAndVerify(hours) {
    this.getIssueDetailsModal().within(() => {
      this.changeEstimatedTime(hours);
      this.verifyEstimatedTime(hours);
    });
  }

  removeEstTimeAndVerify() {
    this.getEstimatedTimeField()
      .clear()
      .wait(6000)
      .should('have.value', '')
      .and('have.attr', 'placeholder', 'Number');
  }

  fillTimeTrackingFieldsAndVerify(spentTime, remainingTime) {
    this.getSpentTimeField()
      .first()
      .clear()
      .type(spentTime)
      .should('have.value', spentTime)
      .then(() => {
        this.getStopWatchIcon()
          .next()
          .children()
          .should('contain', `${spentTime}h logged`);
      });

    this.getRemainingTimeField()
      .last()
      .clear()
      .type(remainingTime)
      .should('have.value', remainingTime)
      .then(() => {
        this.getStopWatchIcon()
          .next()
          .children()
          .should('contain', `${remainingTime}h remaining`);
      });
  }

  removeTimeTrackingFieldsAndVerify(hours) {
    this.getSpentTimeField()
      .first()
      .clear()
      .should('have.value', '')
      .then(() => {
        this.getStopWatchIcon()
          .next()
          .children()
          .should('contain', this.noTimeLoggedText);
      });

    this.getRemainingTimeField()
      .last()
      .clear()
      .should('have.value', '')
      .then(() => {
        this.getStopWatchIcon()
          .next()
          .children()
          .should('contain', `${hours}h estimated`);
      });
  }

  addSpentAndRemainingTime(hours, spentTime, remainingTime) {
    this.getTimetrackingModal()
      .should('exist')
      .within(() => {
        this.getStopWatchIcon(hours)
          .next()
          .children()
          .should('contain', this.noTimeLoggedText)
          .and('contain', `${hours}h estimated`);

        this.fillTimeTrackingFieldsAndVerify(spentTime, remainingTime);
      });
  }
}

export default new IssueTimeTracking();
