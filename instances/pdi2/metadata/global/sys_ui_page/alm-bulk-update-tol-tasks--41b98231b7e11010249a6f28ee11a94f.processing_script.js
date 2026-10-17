if ('false' == cancelled) {
	var OPEN_STATE = 1;
	var INPROGRESS_STATE = 2;
	var CLOSED_COMPLETE_STATE = 3;
	var errorList=[];
	var maxProcessingCount = parseInt(maxLinesCount);
	var needLimiting = !gs.nil(selectedLinesCount) && parseInt(selectedLinesCount) > maxProcessingCount;
	var lineTaskGr = new GlideRecord('alm_transfer_order_line_task');
	lineTaskGr.addQuery('transfer_order_line', 'IN', selectedLines);
	lineTaskGr.addQuery('stage', line_item_stage);
	// Open and Inprogress state tasks
	lineTaskGr.addQuery('state', [OPEN_STATE, INPROGRESS_STATE]);
	if (needLimiting) {
		lineTaskGr.setLimit(maxProcessingCount);
	}
	lineTaskGr.query();
	while (lineTaskGr.next()) {
		lineTaskGr.setValue('assigned_to', assigned_to);
		if (lineTaskGr.getValue('stage') === 'in_transit') {
			lineTaskGr.setValue('tracking_number', tracking_number);
			lineTaskGr.ship_date = ship_date;
			lineTaskGr.setValue('vendor', vendor);
		}
		var toLine = lineTaskGr.transfer_order_line;
		// Perform same action as of 'Close Task'
		// Existing BR 'Check if quantity received is populated' mandates quantity received
		// when stage is 'Received' for a consumable and full quantity is received
		// Hence setting it
		if (lineTaskGr.getValue('stage') === 'received' && !(gs.nil(toLine.quantity_remaining))
			&& (toLine.model.sys_class_name.toString() === 'cmdb_consumable_product_model'
				|| toLine.model.asset_tracking_strategy.toString() === 'track_as_consumable')) {
			// Only for consumables, update the Quantity Received
			lineTaskGr.setValue('quantity_received', toLine.quantity_remaining);
		}
		lineTaskGr.state = CLOSED_COMPLETE_STATE;
		try {
			lineTaskGr.update();
		} catch (error) {
			errorList.push(toLine.number);
		}
	}
	if (errorList.length > 0) {
		gs.addErrorMessage(gs.getMessage('Update has failed for transfer order line tasks with transfer order lines {0}.', errorList.join(', ')));
	} else {
		if (needLimiting) {
			gs.addInfoMessage(gs.getMessage('{0} transfer order lines have been updated.', maxLinesCount));
		} else {
			gs.addInfoMessage(gs.getMessage('The selected transfer order lines have been updated.'));
		}
	}
	response.sendRedirect("alm_transfer_order.do?sys_id=" + transfer_order);
}
