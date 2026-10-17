(function executeRule(current, previous /*null when async*/) {
	var viewTemplateSlotProvider = new GlideRecord("sys_sg_view_template_slot");
	viewTemplateSlotProvider.addQuery("view_template", current.view_template);	
	viewTemplateSlotProvider.addQuery("type", "video");
	if(current.operation() == "update")
		viewTemplateSlotProvider.addQuery("sys_id", "!=", current.sys_id);
		
	viewTemplateSlotProvider.query();
	if(viewTemplateSlotProvider.getRowCount() > 0){
		current.setAbortAction(true);
		var errormsg = gs.getMessage("Only one card template element of type video can be added to a template.");		
		gs.addErrorMessage(errormsg);
	}
})(current, previous);
