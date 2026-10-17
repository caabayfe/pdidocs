(function executeRule(current, previous /*null when async*/) {
	// Perform below validation only when model category and/or stage are changed
	if(current.model_category.toString() !== previous.model_category.toString() || current.stage.toString() !== previous.stage.toString()){
		var domainId = global.TransferOrderLineTemplateTaskAPI.getCurrentDomainSysId();
		var taskGr = new GlideRecord('alm_template_task');
		taskGr.addQuery('stage', current.stage);
		taskGr.addQuery('model_category', current.model_category);
		taskGr.addQuery('sys_domain', domainId);
		taskGr.query();
		if(taskGr.hasNext()){
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Model category with the stage already exists'));
		}
	}
	
})(current, previous);
