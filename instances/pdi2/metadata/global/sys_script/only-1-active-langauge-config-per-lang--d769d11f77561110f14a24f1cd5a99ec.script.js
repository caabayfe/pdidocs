(function executeRule(current, previous /*null when async*/) {

	// gets active solution name for the given config and language
	var results = AutoResolutionLanguageHelper.getSolutionNameAndVersionForLanguage(current.configuration, current.training_language);
	if (Object.keys(results).length > 0) {
		current.active = previous.active;
		gs.addErrorMessage(gs.getMessage('Auto-Resolution configuration can have only one active model for a language={0}.', GlideStringUtil.escapeHTML(current.training_language)));
		current.setAbortAction(true);
		gs.setRedirect(current);
	}
})(current, previous);
