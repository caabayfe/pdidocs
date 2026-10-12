function onChange(control, oldValue, newValue, isLoading) {

	if (isLoading && g_form.isNewRecord()) {
		control.value = newValue = 'a56213111b030100adca1e094f0713ac';
		var opts = $('sys_select.wf_workflow_version.column_renderer').childElements();
		for (var i = 0; i < opts.length; i++)  {
			if (opts[i].value == newValue) {
				opts[i].selected = true;
				break;
			}
		}
	}
	
	if (newValue == '007c2f021b020100adca1e094f0713b4') {
	    g_form.setVisible('stage_order', false);
        g_form.setValue('stage_order', 'computed');
		return;
	}
	
    g_form.setVisible('stage_order', true);
	   
    if (newValue == '30b26b511b120100adca1e094f071388') {  // linear?
		g_form.setValue('stage_order', 'user_specified');
		g_form.setReadOnly('stage_order', true);
	} else
		g_form.setReadOnly('stage_order', false);
}
