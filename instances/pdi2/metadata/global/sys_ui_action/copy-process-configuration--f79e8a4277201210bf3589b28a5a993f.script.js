try {
    var grProcess = new global.ProminUIAction().copyProcessConfigForTable(current.table);
    action.setRedirectURL(grProcess);
} catch (error) {
    gs.addErrorMessage(error);
    action.setRedirectURL(current);
}
