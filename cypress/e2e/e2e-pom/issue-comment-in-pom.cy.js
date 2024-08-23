// add this .js file to 'e2e-pom' folder
// add IssueComments.js file to 'pages' folder

import IssueComment from '../../pages/IssueComment';
import { faker } from '@faker-js/faker';

// Variables
let issueTitle = 'This is an issue of type: Task.';
const randomComment = faker.lorem.sentence(10);

// Test cases
describe('Issue comments creating, editing and deleting', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project/board`)
      .then((url) => {
        cy.visit(url + '/board');
        cy.contains(issueTitle).click();
      });
  });

  it('Should create, edit and delete a comment', () => {
    const issueComment = {
      comment: randomComment,
      newComment: 'This is lorem ipsum',
    };

    IssueComment.addNewComment(issueComment);
    IssueComment.editExitingComment(issueComment);
    IssueComment.deleteExistingComment(issueComment);
  });
});
