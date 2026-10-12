(function() {
	var fields = ['sysId', 'tableName', 'displayValueList', 'dueDateDisplayValue', 'level', 'onTicketPage', 'isCompleted', 'hasDueDate'];
	function copyFields(from) {
		var field;
		for (var x in fields) {
			field = fields[x];
			if (!gs.nil(from[field])) {
				data[field] = from[field];
			}
		}
	}
	if (input) {
		copyFields(input);
	}
	if (options) {
		copyFields(options);
	}
})();
