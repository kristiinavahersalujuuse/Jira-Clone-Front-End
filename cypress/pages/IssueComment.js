class IssueComment {
  constructor() {
    // buttons
    this.deleteCommentButton = 'Delete comment';
    this.deleteButton = 'Delete';
    this.editCommentButton = 'Edit';
    this.saveCommentButton = 'Save';

    // views
    this.issueDetailsModal = '[data-testid="modal:issue-details"]';
    this.existingComment = '[data-testid="issue-comment"]';
    this.confirmDelModal = '[data-testid="modal:confirm"]';

    // fields
    this.addCommentArea = 'textarea[placeholder="Add a comment..."]';
    this.addCommentText = 'Add a comment...';

    // text
    this.deleteText = 'Are you sure you want to delete this comment?';
    this.deleteMessage = "Once you delete, it's gone for good.";
  }

  // Functions to get buttons and fields:

  getIssueDetailsModal() {
    return cy.get(this.issueDetailsModal);
  }

  getAddComment() {
    return cy.get(this.addCommentArea);
  }

  getExistingComment() {
    return cy.get(this.existingComment);
  }

  getSaveCommentButton() {
    return cy.contains('button', this.saveCommentButton);
  }

  getAddCommentText() {
    return cy.contains(this.addCommentText);
  }

  getAddCommentArea() {
    return cy.get(this.addCommentArea);
  }

  getConfirmDelModal() {
    return cy.get(this.confirmDelModal);
  }

  // Functions with multiple actions:

  addNewComment(issueComment) {
    this.getIssueDetailsModal().within(() => {
      this.getAddCommentText().click();
      this.getAddComment().type(issueComment.comment);
      this.getSaveCommentButton().click().should('not.exist');
      this.getAddCommentText().should('exist');
      this.getExistingComment().should('contain', issueComment.comment);
    });
  }

  editExitingComment(issueComment) {
    this.getIssueDetailsModal().within(() => {
      this.getExistingComment()
        .first()
        .contains(this.editCommentButton)
        .click()
        .should('not.exist');
      this.getAddCommentArea()
        .should('contain', issueComment.comment)
        .clear()
        .type(issueComment.newComment);
      this.getSaveCommentButton().click().should('not.exist');
      this.getExistingComment()
        .should('contain', this.editCommentButton)
        .and('contain', issueComment.newComment);
    });
  }

  deleteExistingComment(issueComment) {
    //lisatda within
    this.getIssueDetailsModal()
      .find(this.existingComment)
      .contains(this.deleteButton)
      .click();

    this.getConfirmDelModal().within(() => {
      cy.contains(this.deleteText).should('exist');
      cy.contains(this.deleteMessage).should('exist');
      cy.contains('button', this.deleteCommentButton)
        .click()
        .should('not.exist');
    });

    this.getIssueDetailsModal()
      .find(issueComment.newComment)
      .should('not.exist');
  }
}

export default new IssueComment();
