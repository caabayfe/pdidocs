// ef89e4fc372001006b882d465abe5d60 is powershell

preventUpdate();

function preventUpdate() {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("This built-in directory should not be updated"));		
}
