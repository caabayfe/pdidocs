// do not allow any other template to be named Default
var defaultName = 'Default'.toLowerCase();
if (current.name.trim().toLowerCase() == defaultName && previous.name.trim().toLowerCase() != defaultName) {					
	gs.addErrorMessage(gs.getMessage('There can be only one PDF page header footer template named Default'));
	current.setAbortAction(true);
} else if (previous.name.trim().toLowerCase() == defaultName && current.name.trim().toLowerCase() != defaultName) {
	gs.addErrorMessage(gs.getMessage('Cannot change the name of the Default PDF page header footer template'));
	current.setAbortAction(true);
}
