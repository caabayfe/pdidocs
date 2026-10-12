(function executeRule(current, previous /*null when async*/) {
	var source = '' + current.conversion_date_source;
	if (JSUtil.nil(source))
		return;

	var ce = new GlideCompositeElement(source, current.target_table);
	if (!ce.isValid()) {
		gs.addInfoMessage(gs.getMessage('Invalid field {0} in target table {1}', [source, current.field.name]));
		current.setAbortAction(true);
		return;
	}

	// check for type
	var ed = ce.getTargetED();
	if (ed.getInternalType() != "glide_date_time") {
		gs.addInfoMessage(gs.getMessage('Invalid field type {0} for field {1}. Field has to be of type glide_date_time.', [ed.getInternalType(), source]));
		current.setAbortAction(true);
		return;		
	}
})(current, previous);
