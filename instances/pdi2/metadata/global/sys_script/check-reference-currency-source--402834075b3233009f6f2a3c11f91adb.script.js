(function executeRule(current, previous /*null when async*/) {
	var source = '' + current.reference_currency_source;
	if (JSUtil.nil(source))
		return;

	var ce = new GlideCompositeElement(source, current.target_table);
	if (!ce.isValid()) {
		gs.addInfoMessage(gs.getMessage('Invalid field {0} in target table {1}', [source, current.target_table]));
		current.setAbortAction(true);
		return;
	}

	// check for type
	var ed = ce.getTargetED();
	if (ed.getInternalType() != 'string' && !(ed.isReference() && ed.getReference() == 'fx_currency')) {
		gs.addInfoMessage(gs.getMessage('Invalid field type {0} for field {1}. Field has to be reference to fx_currency or string.', [ed.getInternalType(), source]));
		current.setAbortAction(true);
		return;		
	}

})(current, previous);
