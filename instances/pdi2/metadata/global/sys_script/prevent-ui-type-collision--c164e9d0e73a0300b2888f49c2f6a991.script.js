(function executeRule(current, previous /*null when async*/) {

	// case ui_type ->
	//    all:
	//        no other record for the same field
	//    desktop:
	//        no other record for the same field and ui_type = (all or desktop)
	//    mobile_sp:
	//        no other record for the same field and ui_type = (all or mobile_sp)
	
	var DESKTOP = 'Desktop';
	var MOBILE_SP = 'Mobile / Service Portal';
	var ALL = 'All';
	
	function getUiType(id) {
		if (id === '1') { return MOBILE_SP; }
		if (id === '10') { return ALL; }
		return DESKTOP;
	}
	
	function ensureFieldType(internal_type) {
		if (!internal_type || internal_type === '') {
			gs.addErrorMessage(gs.getMessage('Please select a field type'));
			return false;
		}
		
		return true;
	}
	
	var internal_type = current.getValue('internal_type');
	
	if (!ensureFieldType(internal_type)) { 
		current.setAbortAction(true);
		return false; 
	}
	
	var current_ui_type = getUiType(current.getValue('ui_type'));
	
	var gr = new GlideRecord('sys_script_validator');
	gr.addQuery('internal_type', internal_type);
	if (!current.isNewRecord()) { gr.addQuery('sys_id', '!=', current.getUniqueValue()); }
	gr.query();
	
	var error = false;
	var ui_type = '';
	
	while (gr.next()) {
		ui_type = getUiType(gr.getValue('ui_type'));
		
		if (current_ui_type === ALL || ui_type === ALL || current_ui_type === ui_type) {
			error = true;
			break;
		}
	}
	
	if (error) {
		gs.addErrorMessage(gs.getMessage("There already exists another validation script for the '" + internal_type + "' field with ui type '" + ui_type + "'"));
		current.setAbortAction(true);
	}

})(current, previous);
