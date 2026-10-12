(function executeRule(current, previous /*null when async*/) {
	var translatorMapping = new GlideRecord('translator_mapping');
	translatorMapping.addQuery('language',current.language);
	translatorMapping.query();
	if(translatorMapping.hasNext()){
		gs.addErrorMessage(gs.getMessage('Translator mapping already exists for the selected language'));
		current.setAbortAction(true);
	}
	
})(current, previous);
