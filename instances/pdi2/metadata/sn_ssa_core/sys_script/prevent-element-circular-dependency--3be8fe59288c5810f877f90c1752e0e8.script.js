var recursionChecker = new SSARecursionChecker();

	if (recursionChecker.isRecursiveLoop(current)){
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('The selected element group forms a recursive loop.'));
	}



	
