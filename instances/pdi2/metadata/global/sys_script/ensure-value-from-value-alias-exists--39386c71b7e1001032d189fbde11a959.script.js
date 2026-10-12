(function executeRule(current, previous /*null when async*/) {

	// Get the Field Alias that we belong to
	var fieldAlias = new GlideRecord('sys_report_field_alias');
	if (! fieldAlias.isValid()) {
		gs.addErrorMessage(gs.getMessage('There is something wrong with the Field Alias table'));
		current.setAbortAction(true);
		return;
	}
	fieldAlias.setWorkflow(false);
	if (! fieldAlias.get(current.field_alias)) {
		gs.addErrorMessage(gs.getMessage('This Field Alias does not exist'));
		current.setAbortAction(true);
		return;
	}
	// Get the type of the field. We handle two types of fields: choice fields and references
	var table = new GlideRecord(fieldAlias.getValue('table'));
	table.initialize();
	if (! table.isValid()) {
		gs.addErrorMessage(gs.getMessage('Invalid table {0}', fieldAlias.getValue('table')));
		current.setAbortAction(true);
		return;
	}
	var element = table.getElement(fieldAlias.getValue('field'));
	var elementDescriptor = element.getED();
	var isChoiceTable = elementDescriptor.isChoiceTable();
	var isReference = elementDescriptor.isReference();
	
	// We only do this check on choice and reference fields
	if (isChoiceTable || isReference) {
		
		var tableLabel = table.getClassDisplayValue();
		var fieldLabel = element.getLabel();
		
		if (isChoiceTable) {
			
			var choiceList = new GlideChoiceListGenerator(elementDescriptor).get();
			if ( ! choiceList.getChoice(current.value)) {
				gs.addErrorMessage(gs.getMessage('The choice {0} does not exist for the {1}.{2} choice list', [current.value, tableLabel, fieldLabel]));
				current.setAbortAction(true);
				return;
			}
		
		} else {

			var tableGR = new GlideRecord(fieldAlias.getValue('table'));
			if (! tableGR.isValid()) {
				gs.addErrorMessage(gs.getMessage('There is something wrong with the {0} table', tableLabel));
				current.setAbortAction(true);
				return;
			}
			tableGR.addQuery(fieldAlias.getValue('field'), current.value);
			tableGR.setWorkflow(false);
			tableGR.setLimit(1);
			tableGR.query();
			if (! tableGR.hasNext()) {
				gs.addErrorMessage(gs.getMessage('No record exists in column {0}.{1} having the given reference', [tableLabel, fieldLabel]));
				current.setAbortAction(true);
				return;
			}
		}
	}

})(current, previous);
