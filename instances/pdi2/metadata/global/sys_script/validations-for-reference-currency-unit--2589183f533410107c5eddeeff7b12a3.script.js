(function executeRule(current, previous /*null when async*/ ) {
	var type = current.type;
	// we dont support use reference currency unit for formulae, manual, external indicators.
	if (type == '2' || type == '3' || type == '4') {
		gs.addErrorMessage(gs.getMessage("'Use Reference Currency' unit is not supported for {0} Indicators", current.type.getDisplayValue()));
		current.setAbortAction(true);
		return;
	}

    if (!(current && current.cube && current.cube.facts_table))
        return;

    var tablename = current.cube.facts_table;
    var field = current.field;
    if (current.aggregate == 1 || current.aggregate == 6) {
        var aggregate = current.aggregate == 1 ? 'Count' : 'Count Distinct';
        gs.addErrorMessage(gs.getMessage('"Use Reference Currency" unit is not supported for the aggregate {0}', [aggregate]));
		current.setAbortAction(true);
        return;
    }

    var glideRecord = new GlideRecord(tablename);
    var glideElement = glideRecord.getElement(field);
    type = '';
    if (glideElement !== null) {
        var descriptor = glideElement.getED();
        if (descriptor)
            type = descriptor.getInternalType();
    }
    if (!(type == 'currency2' || type == 'currency' || type == 'price' || type == 'decimal')) {
		var fieldLabel = glideElement !== null ? glideElement.getLabel() : field;
        gs.addErrorMessage(gs.getMessage('"Use Reference Currency" unit is not supported for the field {0}', [fieldLabel]));
		current.setAbortAction(true);
    }
})(current, previous);
