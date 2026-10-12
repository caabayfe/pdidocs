function onAfter(current, previous) {
	var isQueryUpdated = true;
	var isGroupUpdated = true;
	
	if ((typeof previous != 'undefined') && (previous.getValue("name") !== null)) {
		if (current.getValue("table") == previous.getValue("table")){
			var prevFilter = previous.getValue("filter");
			var currFilter = current.getValue("filter");
			if (currFilter == prevFilter)
				isQueryUpdated = false;
		}
		if(current.getValue("cmdb_group") == previous.getValue("cmdb_group"))
			isGroupUpdated = false;
	}
	
	if (isQueryUpdated || isGroupUpdated) {
		var qbsManager = new SNC.QueryBasedServiceManager();
		qbsManager.updateSvcAssoc(current.getUniqueValue()); 
	}
}
