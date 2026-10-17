function onCondition() {
	if (g_form.getValue('workspace_config')){
		if(!g_form.getValue('type_ext') && g_form.getValue('renderer_type')){
			if(g_form.getValue('renderer_type') == "record"){
				g_form.setValue('type_ext','record');
			}
			else if(g_form.getValue('renderer_type') == "layout"){ 
				g_form.setValue('type_ext','layout');
			}
		}
	}
}
