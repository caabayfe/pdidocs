function onAfter(current, previous) {
	var isFilterUpdated=true;
	if ((typeof previous != 'undefined') && (previous.getValue("name") !== null)) {
		if (current.getValue("table") == previous.getValue("table")) {
			var prevFilter = previous.getValue("filter");
			var currFilter = current.getValue("filter");
			if (currFilter == prevFilter)
				isFilterUpdated = false;
		}
	}
	if (isFilterUpdated==true) {
		var slaConfigurationManager = new SNC.SlaConfigurationManager();
		slaConfigurationManager.updateSvcAssoc(current.getUniqueValue(), true);
	}
}
