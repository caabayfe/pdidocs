canAccess();

function canAccess() {
	var tableName = current.getValue("name");
	var dbo = new GlideRecord("sys_db_object");
	
	if(!tableName)
		return false;
	
	var tableList = GlideDBObjectManager.get().getHierarchy(tableName);
	for (var x = 0; x < tableList.size(); ++x) {
		var tableParent = tableList.get(x);
		
		dbo.initialize();
		dbo.addQuery("name", tableParent);
		dbo.query();
			
		if (dbo.next() && dbo.canRead())
			return true;
	}
	return false;
	
}
