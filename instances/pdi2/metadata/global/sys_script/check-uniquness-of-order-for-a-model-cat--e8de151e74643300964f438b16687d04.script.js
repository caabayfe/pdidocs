(function executeRule(current, previous /*null when async*/) {
	// Perform below validation only when model category and/or order are changed
	if(!(current.model_category.toString() === previous.model_category.toString() && current.order.toString() === previous.order.toString())){
		var domainId = global.TransferOrderLineTemplateTaskAPI.getCurrentDomainSysId();
		var taskGr = new GlideRecord('alm_template_task');
		taskGr.addQuery('order', current.order);
		taskGr.addQuery('model_category', current.model_category);
		taskGr.addQuery('sys_domain', domainId);
		taskGr.query();
		if(taskGr.hasNext()){
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Model category with the order already exists'));
		}
	}
	
})(current, previous);
