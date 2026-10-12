(function refineQuery(current, parent) {

    var fcObj = {};
    var gr = new GlideRecord('sys_sg_filter_condition_m2m_filter_condition_attribute');
	if (!gr.isValid()) {
		var message = gs.getMessage('Invalid table {0}', 'sys_sg_filter_condition_m2m_filter_condition_attribute');
		gs.addErrorMessage(message); 
		current.addQuery('sys_id', 'IN', '');
		return;
	}
	
    gr.addQuery('filter_condition_attribute', parent.getUniqueValue());
    gr.query();
    while (gr.next())
        fcObj[gr.getValue('filter_condition')] = true;
	
    current.addQuery('sys_id', 'IN', Object.keys(fcObj).join(','));

})(current, parent);
