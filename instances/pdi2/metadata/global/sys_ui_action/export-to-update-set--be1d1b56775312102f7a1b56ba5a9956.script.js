try {
    var response = new global.ProminUIAction().exportProcessConfigToUpdateSet(current);
    action.setRedirectURL(current);
	gs.addInfoMessage(response);
} catch (error) {
    gs.addErrorMessage(error);
    action.setRedirectURL(current); 
}
