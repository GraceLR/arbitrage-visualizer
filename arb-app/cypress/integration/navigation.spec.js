describe('Navigation', () => {
    it('should visit root', () => {
        cy.visit('/');
    });
    // it("should add a node", () => {
    //   cy.visit("/");
    //   cy.contains("[data-testid=day]", "Tuesday")
    //     .click()
    //     .should("have.css", "background-color", "rgb(242, 242, 242)");
    // });
});