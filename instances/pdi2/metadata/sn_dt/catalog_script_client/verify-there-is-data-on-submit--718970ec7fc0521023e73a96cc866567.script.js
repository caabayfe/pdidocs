function onSubmit() {
	var exactMatchesObj = JSON.parse(g_form.getValue("exact_matches"));
	var patternMatchesObj = JSON.parse(g_form.getValue("pattern_matches"));
	if (exactMatchesObj.length === 0 && patternMatchesObj.length === 0) {
		g_form.addErrorMessage(getMessage("Please fill out some data before submitting"));
		return false;
	}
}
