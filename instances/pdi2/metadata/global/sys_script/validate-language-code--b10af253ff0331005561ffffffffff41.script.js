function onBefore(current, previous) {
	var patt = /[a-z][a-z]-[A-Z][A-Z]/;

	if(!patt.test(current.language_code)) {
		gs.addErrorMessage(gs.getMessage("Invalid language code. Code must be 2 lower case characters followed by a dash followed by 2 upper case characters e.g. en-US"));
		current.setAbortAction(true);
	}
}
