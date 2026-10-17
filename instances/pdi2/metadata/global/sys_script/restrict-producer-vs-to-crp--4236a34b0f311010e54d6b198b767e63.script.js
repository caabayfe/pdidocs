(function executeRule(current, previous /*null when async*/) {

	function abortAction(message) {
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}

	var catItemGr = current.getElement('sc_cat_item').getRefRecord();
	if (catItemGr.getValue('sys_class_name') != "sc_cat_item_composite_producer")
		abortAction(gs.getMessage("Attaching a producer variable set to a non Composite Producer item type is restricted"));
	else {
		var crpTargetTable = catItemGr.getValue('table_name');
		var crpTargetTableGr = new GlideRecord(crpTargetTable);
		if (!crpTargetTableGr.isValid()) {
			abortAction(gs.getMessage("The {0} composite record producer must have a valid table associated with it",catItemGr.getDisplayValue('name')));
			return;
		}
		var varSetGr = current.getElement('variable_set').getRefRecord();
		var producerSetTargetTable = varSetGr.getValue('table_name');
		var producerSetTargetTableGr = new GlideRecord(producerSetTargetTable);
		if (!producerSetTargetTableGr.isValid()) {
			abortAction(gs.getMessage("The {0} producer set must have a valid table associated with it", varSetGr.getDisplayValue('title')));
			return;
		}
		var producerSetParentReferenceField = varSetGr.getValue('parent_reference_field');
		if (!producerSetTargetTableGr.isValidField(producerSetParentReferenceField)) {
			abortAction(gs.getMessage("The {0} producer set must have a valid Parent reference field",varSetGr.getDisplayValue('title')));
			return;
		}
		var referencedTable = producerSetTargetTableGr.getElement(producerSetParentReferenceField).getReferenceTable();
		if (!crpTargetTableGr.instanceOf(referencedTable))
			abortAction(gs.getMessage("The table referenced by the Parent reference field on the {0} producer set associated with the {1} composite record producer must be the same table configured with the composite record producer or a parent of that table",[varSetGr.getDisplayValue('title'),catItemGr.getDisplayValue('name')]));
	}
})(current, previous);
