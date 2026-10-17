function onLoad() {
	
    if (g_form.getValue('process_def') && !g_form.getValue('project')) {
        g_form.setDisplay('process_def', true);
        g_form.setDisplay('project', false);
		g_form.setMandatory('process_def', true);
    }
    else if (g_form.getValue('project') && !g_form.getValue('process_def')) {
        g_form.setDisplay('process_def', false);
        g_form.setDisplay('project', true);
		g_form.setMandatory('project', true);
    }
    else if (!g_form.getValue('project') && !g_form.getValue('process_def')) {
        g_form.setDisplay('project', false);
    }
  
}
