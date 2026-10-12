if (new PAUtils().hasKeywordsInConditions(current.conditions)) {
	gs.addErrorMessage(gs.getMessage("The usage of Keywords in Conditions is not supported"));
	current.setAbortAction(true);
}
