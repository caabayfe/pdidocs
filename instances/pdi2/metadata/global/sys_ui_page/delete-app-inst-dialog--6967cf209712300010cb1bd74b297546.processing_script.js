if(selection_result == 'yes') {
    var gr = new GlideRecord('cmdb_ci_appl');
    gr.addQuery('classifier', '' + my_sys_id);
    gr.query();
    while (gr.next())
    	gr.deleteRecord();
}

// reload the current form...
response.sendRedirect('discovery_classy_proc.do?sys_id=' + my_sys_id);
