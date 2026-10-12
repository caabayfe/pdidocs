(function executeRule(current, previous /*null when async*/) {	
	if (JSUtil.nil(current.rate_filter_target_table_field)) {
		gs.addInfoMessage(gs.getMessage("Missing rate filter target table field"));
		current.setAbortAction(true);
	}

	if (JSUtil.nil(current.rate_filter_rate_table_field)) {
		gs.addInfoMessage(gs.getMessage("Missing rate filter rate table field"));
		current.setAbortAction(true);		
	}
	
	var source = '' + current.rate_filter_target_table_field;
	
	var ce = new GlideCompositeElement(source, current.target_table);
	if (!ce.isValid()) {
		gs.addInfoMessage(gs.getMessage('Invalid field {0} in target table {1}', [source, current.target_table]));
		current.setAbortAction(true);
		return;
	}

	var ed = ce.getTargetED();
	if ((ed.getName()).startsWith("sys_")) {
	    gs.addInfoMessage(gs.getMessage('Invalid field {0} for Target Table Field. Field cannot be a system field.', [source]));
	    current.setAbortAction(true);
	    return;
	}
})(current, previous);
