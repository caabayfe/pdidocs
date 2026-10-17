(function executeRule(current, previous /*null when async*/) {

	// Validate that the template is a valid configuration combination of application/object and type. For 
	// instance, flow templates can presently only be object templates. There is other work to add additional
	// validation rules for other template combinations.
	
	var _TemplateFlowModel = new TemplateFlowModel(current);
	
	// Additional validation rules to be added in future work. However, this rule will error out explictly if
	// a template is of type flow template and is also an application template.
	
	if (_TemplateFlowModel.isAppTemplate() && _TemplateFlowModel.isFlowTemplate()) {
		var errorMessage = gs.getMessage('Cannot create an Application template of type {0}', [_TemplateFlowModel.getTemplateTypeName()]);
		gs.addErrorMessage(errorMessage)
		current.setAbortAction(true);
		return;
	}
	
})(current, previous);
