(function() {
	/* populate the 'data' object */
	/* e.g., data.table = $sp.getValue('table'); */
	
	var tables = [];
	var selectedTables = [];
	
	var snBigTablesStr =  gs.getProperty("com.glide.domain.audit.big_tables", "");
	var snBigTables = snBigTablesStr.split(",");
	
	if (input) {
		gs.setProperty("glide.sys.domain.verbose", input.verboseLogging);
		
		var usrSelectedTables = "";
		for (var i = snBigTables.length; i < input.selectedTables.length; i++) {
			if (i == input.selectedTables.length-1) {
				usrSelectedTables += input.selectedTables[i].name;
			} else {
				usrSelectedTables += input.selectedTables[i].name  + ",";
			}
		}
		gs.setProperty("com.glide.domain.audit.big_tables.additional", usrSelectedTables);
	}
	
	var big_tables_adtnl = gs.getProperty("com.glide.domain.audit.big_tables.additional", "");
	var big_tables = (big_tables_adtnl !== "") ? snBigTablesStr + "," + big_tables_adtnl: snBigTablesStr;
	
	var bigTables = big_tables.split(",");
	
	for (var j = 0; j < bigTables.length; j++) {
		var tableName = bigTables[j].trim();
		selectedTables.push({
			name: tableName,
			isSNBigTable: snBigTables.indexOf(tableName) === -1 ? false : true
		});
	}
	
	var selected = [];
	for (var k = 0; k < selectedTables.length; k++) {
		selected.push(selectedTables[k].name);
	}
	
	var dbTables = GlideDomainSupport.getDomainTables();
	for (var d = 0; d < dbTables.size(); d++) {
		var dbTable = ""+dbTables.get(d);
		if (selected.indexOf(dbTable) === -1) {
			tables.push({name: dbTable});
		}
	}
	
	// sort tables so they are alphabetical in slushbucket (DS.getDomainTables doesn't return a sorted list)
	tables.sort(function(a, b) {
		if (a.name > b.name)
			return 1;
		else if (a.name < b.name)
			return -1;
		return 0;
	});
		
	data.data_separation = gs.getProperty("glide.sys.domain.partitioning", "false");
	data.process_separation = gs.getProperty("glide.sys.domain.delegated_administration", "false");
	
	var verboseLogging = gs.getProperty("glide.sys.domain.verbose");
	
	data.tables = tables;
	data.selectedTables = selectedTables;
	data.verboseLogging = verboseLogging;
	data.snBigTables = snBigTables;
	data.updateMessage = gs.getMessage("Configurations updated");
})();
