validateInput();

function validateInput() {
	// Check that "field" field is valid:
	current.field = current.field.trim();
	if(gs.nil(current.field)) {
		gs.addErrorMessage(gs.getMessage('Invalid "field" field: {0}', [current.field]));
		current.setAbortAction(true);
		return;
	}	
}
