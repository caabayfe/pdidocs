(function executeRule(current, previous /*null when async*/) {
	var viewSysID = current.getValue('view');
	var viewTables = new GlideRecord('sys_db_view_table');
	viewTables.addQuery('view', viewSysID);
	var uniqueOrders = [];
	viewTables.query();
	while (viewTables.next()) {
		var order = viewTables.getValue('order');
		if (arrayContains(uniqueOrders, order)) {
			var viewRecord = new GlideRecord('sys_db_view');
			viewRecord.get(viewSysID);
			var viewName = viewRecord.getValue('name');
			var msg = gs.getMessage('View "{0}" has more than one table with order {1}', [viewName, order]);
			gs.warn(msg);
			gs.addWarningMessage(msg);
			break;
		}
		uniqueOrders.push(order);
	}
})(current, previous);

// Set isn't available in the Glide-supported JavaScript.
function arrayContains(array, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === value) {
			return true;
		}
	}
	return false; 
}
