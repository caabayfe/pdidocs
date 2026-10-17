(function executeRule(current, previous /*null when async*/) {
	
	// Checks whether the record is already present in the DB or not. Further computation should only happen for existing record 
  	if (current.isNewRecord())
    		return;
 
	var gr = new GlideRecord('pa_m2m_dashboard_sources');
	gr.addQuery('dashboard', current.getValue('sys_id'));
	gr.query();

	//Show 'Disable multiple element selection field' if at least 1 entry is present in breakdown source related list
	g_scratchpad.disable_multiple_element_select = (gr.getRowCount() > 0 ) ? false : true;
	
	// incase it was set earlier and we removed all the breakdown source mappings we need to sync the field
	if (g_scratchpad.disable_multiple_element_select && current.getValue('disable_multiple_element') == 1) {
		current.setValue('disable_multiple_element', 0);
		current.setWorkflow(false);
		current.update();
	}

})(current, previous);
