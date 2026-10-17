if(gs.nil(current.name) || current.name.trim().length == 0){
	gs.addErrorMessage( gs.getMessage('Name cannot be empty') );
	current.setAbortAction(true);
}

if(gs.nil(current.pattern) || current.pattern.trim().length == 0){
	gs.addErrorMessage( gs.getMessage('Pattern cannot be empty') );
	current.setAbortAction(true);
}
