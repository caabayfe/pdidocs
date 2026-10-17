function onLoad() {
	
	if( g_form.isNewRecord()  && !g_scratchpad.standard_ui_enabled){
		g_form.removeOption('type', 'platform');
		g_form.setValue('type','service_portal');
	}
	if( g_form.isNewRecord()  && !g_scratchpad.sp_enabled){
		g_form.removeOption('type', 'service_portal');
		g_form.setValue('type','platform');
	}
	
	g_form.setMandatory('name',true);
	
	if(!g_form.isNewRecord()){
		g_form.setReadOnly('type',true);
	}
		
	
	// set status to draft for new records
	if(g_form.isNewRecord())
		g_form.setValue('status','draft');
	
	var additional_params_placeholder =  new GwtMessage().getMessage("Add URL parameters to set tour for a specific record or view, e.g. sys_id=abc123&view=myView");

		var fieldName = g_form.getControl('additional_parameters').name.toString();
		if (Prototype.Browser.IE) 
			fieldName.placeholder = additional_params_placeholder;
		else {
			if($(fieldName).writeAttribute)
				$(fieldName).writeAttribute('placeholder', additional_params_placeholder);
		}
}
