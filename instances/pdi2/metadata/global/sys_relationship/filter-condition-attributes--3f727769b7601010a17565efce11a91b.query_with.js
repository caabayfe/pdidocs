(function refineQuery(current, parent) {

    var fcObj = {};
    var gr = new GlideRecord('sys_sg_filter_condition_m2m_filter_condition_field');
	if (!gr.isValid()) {
		var message = gs.getMessage('Invalid table {0}', 'sys_sg_filter_condition_m2m_filter_condition_field');
		gs.addErrorMessage(message);
		current.addQuery('sys_id', 'IN', '');
		return;
	}
	
    gr.addQuery('filter_condition_field', parent.getUniqueValue());
	gr.query();
    while (gr.next())
        fcObj[gr.getValue('filter_condition')] = true;
	
	if (Object.keys(fcObj).length === 0) {
		current.addQuery('sys_id', 'IN', '');
		return;
	}
	
    var fcaObj = {};
    var grAttr = new GlideRecord('sys_sg_filter_condition_m2m_filter_condition_attribute');
	if (!grAttr.isValid()) {
		var msg = gs.getMessage('Invalid table {0}', 'sys_sg_filter_condition_m2m_filter_condition_attribute');
		gs.addErrorMessage(msg);
		current.addQuery('sys_id', 'IN', '');
		return;
	}
	
    grAttr.addQuery('filter_condition', 'IN', Object.keys(fcObj).join(','));
	grAttr.query();
    while (grAttr.next())
        fcaObj[grAttr.getValue('filter_condition_attribute')] = true;
	
    current.addQuery('sys_id', 'IN', Object.keys(fcaObj).join(','));

})(current, parent);
