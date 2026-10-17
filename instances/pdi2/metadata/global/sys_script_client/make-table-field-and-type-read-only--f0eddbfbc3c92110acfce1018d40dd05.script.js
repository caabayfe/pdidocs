function onLoad() {
	
	g_form.setReadOnly('table', true);
    if (!g_form.isNewRecord()) {
        g_form.setReadOnly('field', true);
        g_form.setReadOnly('type', true);
		jQuery("#sys_display\\.promin_automated_finding\\.field").parent().addClass('disabled'); 
    } else {
		
		g_form.setValue("type", "");
		g_form.setValue("field", "");
		g_form.setValue('table', g_form.getReference('process_def').table);
	}
}
