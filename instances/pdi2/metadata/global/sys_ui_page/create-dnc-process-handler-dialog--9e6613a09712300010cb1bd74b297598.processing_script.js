if(selection_result == 'yes') {
    var gr = new GlideRecord('discovery_proc_handler');
	gr.initialize();
    gr.condition = my_condition;
	gr.name = my_name.replace('Auto:', 'Process');
	gr.rps = false;
	gr.adm = true;
	gr.classify = false;
    gr.insert();
}

// reload the current form...
response.sendRedirect('discovery_classy_proc.do?sys_id=' + my_sys_id);
