(function executeRule(current, previous /*null when async*/) {

	var templateWizard = new GlideRecord('sys_app_template_wizard');
	templateWizard.addQuery('template', current.template);
	templateWizard.query();
	if(templateWizard.hasNext()){
		gs.addErrorMessage(gs.getMessage("Template and Template Wizard mapping already exists."));
        current.setAbortAction(true);
	}

})(current, previous);
