function onSubmit() {
	if (g_form.isNewRecord() && g_scratchpad.hasOwnProperty("standardChange") && g_scratchpad.standardChange.hasOwnProperty("preventInactiveInsert")) {
		if (g_scratchpad.standardChange.preventInactiveInsert === true && g_scratchpad.standardChange.stdChangeTemplateActive === false) {
			g_form.clearMessages();

			var translatedMsg = getMessage("Change Requests cannot be created from an inactive Standard Change Template");
			g_form.addErrorMessage(translatedMsg + ": " + g_scratchpad.standardChange.stdChangeTemplateName);

			return false;
		}
	}

	return true;
}
