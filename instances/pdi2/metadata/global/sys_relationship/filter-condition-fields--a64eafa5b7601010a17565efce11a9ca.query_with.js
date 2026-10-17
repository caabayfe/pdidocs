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
	
	if (Object.keys(fcObj).length === 0) {
		current.addQuery('sys_id', 'IN', '');
		return;
	}
	
    var fcfObj = {};
    var grFld = new GlideRecord('sys_sg_filter_condition_m2m_filter_condition_field');
	if (!grFld.isValid()) {
		var msg = gs.getMessage('Invalid table {0}', 'sys_sg_filter_condition_m2m_filter_condition_field');
		gs.addErrorMessage(msg);
		current.addQuery('sys_id', 'IN', '');
		return;
	}
	
    grFld.addQuery('filter_condition', 'IN', Object.keys(fcObj).join(','));
    grFld.query();
    while (grFld.next())
        fcfObj[grFld.getValue('filter_condition_field')] = true;
	
    current.addQuery('sys_id', 'IN', Object.keys(fcfObj).join(','));

})(current, parent);
