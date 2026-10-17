(function executeRule(current, previous /*null when async*/) {
	try {
		
		var _TemplateFlowModel = new TemplateFlowModel(current);
		var flowSysId = "";
	
		if (gs.nil(current.flow)) {
			
			// flows will only be created for NON-no-op templates (templates where type = "Composed" and 
			// the template is NOT an app template)
			var isNoOpTemplate = _TemplateFlowModel.isComposedTemplate() && !_TemplateFlowModel.isAppTemplate();
			
			// NOTE: Payload & Map Templates should never be object templates
			// this should never be allowed to happen, but acts as a fail-safe. 
			// if this case happens, we do not want to create a flow.
			var isPayloadAndMapObjTemplate = _TemplateFlowModel.isPayloadAndMapTemplate() && !_TemplateFlowModel.isAppTemplate();
			
			if (!isNoOpTemplate && !isPayloadAndMapObjTemplate) {
			
				// Flow does not exist in the template definition being inserted, create one and set it.
				flowSysId = new sn_templates.TemplateFlowCreator().createFlow(
					_TemplateFlowModel.getTemplateSysId(),
					_TemplateFlowModel.getFlowName(),
					gs.getCurrentApplicationId(),
					_TemplateFlowModel.isAppTemplate(),
					_TemplateFlowModel.getTemplateType()
				);
				
				current.flow = flowSysId;
			}	
			
		}
	} catch(ex) {
		// If the flow fails to be created for any reason, inform the user and cancel the creation the 
		// template definition. This ensures that if the template definition is created a flow is attached.
		gs.addErrorMessage(ex.getMessage());
		current.setAbortAction(true);
	}	
})(current, previous);
