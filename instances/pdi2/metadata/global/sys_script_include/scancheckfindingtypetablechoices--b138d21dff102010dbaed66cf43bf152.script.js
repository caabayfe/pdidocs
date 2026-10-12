var ScanCheckFindingTypeTableChoices = Class.create();
ScanCheckFindingTypeTableChoices.prototype = {
	initialize: function() {
	},
	
	process: function(tableName) {
		var tables = GlideDBObjectManager.get().getAllExtensions("scan_finding");
		
		var validTables = [];
		validTables.push("scan_finding");
		var size = tables.size();
		for(var i = 0; i < size; i++) {
			var table = tables.get(i);
			if (!table)
				continue;
			validTables.push(table + '');
		}
		return validTables;
	},
	
	type: 'ScanCheckFindingTypeTableChoices'
};
