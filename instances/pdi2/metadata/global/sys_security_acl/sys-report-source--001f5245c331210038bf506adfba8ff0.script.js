//this is a function mimicking the backend logic applied to determine visibility of a table in the Table dropdown
function isPermitted(table) { 
	if (!table.startsWith("sys")) 
		return true; 

	var permitted_sys_tables = GlideProperties.get("glide.ui.permitted_tables"); 
	if (!permitted_sys_tables) 
		return false; 

	var permitted_tables = permitted_sys_tables.split(","); 
	for (var i = 0; i < permitted_tables.length; i++) { 
		if (permitted_tables[i] == table) 
			return true; 

	} 
	return false; 
} 

if(current.table != '') { 
    var tableDescriptor = GlideTableDescriptor.get(current.table); 
    answer = tableDescriptor && tableDescriptor.isValid() && tableDescriptor.canRead() && isPermitted(current.table) && new GlideReportChoiceList().hasReportRights(current.table); 
} else 
    answer = true;
