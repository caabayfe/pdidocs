trim();
PwdNameUniquenessValidator.validate(current);

function trim() {
	current.identification_label = current.identification_label.trim();
	if (!current.identification_label) {
		gs.addErrorMessage(gs.getMessage("You must enter a Identification Label."));
		current.setAbortAction(true);
	}
}
