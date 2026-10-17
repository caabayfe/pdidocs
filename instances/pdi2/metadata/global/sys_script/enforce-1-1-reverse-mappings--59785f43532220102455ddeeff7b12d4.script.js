(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('life_cycle_mapping');
	gr.addActiveQuery();
	gr.addQuery('life_cycle_control', current.getValue('life_cycle_control'));
	gr.addQuery('table', current.getValue('table'));
	gr.addQuery('reverse_sync_choice', 'true');
	gr.addQuery('legacy_field_name', current.getValue('legacy_field_name'));
	gr.query();
	
	if(gr.next()){
		if(gr.getUniqueValue() !== current.getUniqueValue()){
			var table = current.table.getDisplayValue();
			var control = current.life_cycle_control.life_cycle_stage + ' - ' + current.life_cycle_control.life_cycle_stage_status;
			gs.addErrorMessage(gs.getMessage("Multiple reverse mappings from the same table and life cycle control are not allowed.  Another mapping for the {0} table and {1} control is currently selected for reverse mapping.  First set that mapping rule to reverse sync choice of false.", [table, control]));
			current.setAbortAction(true);
		}
	}

})(current, previous);
