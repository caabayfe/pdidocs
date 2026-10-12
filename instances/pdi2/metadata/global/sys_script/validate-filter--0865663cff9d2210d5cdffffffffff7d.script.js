(function executeRule(current, previous /*null when async*/) {
	var blockedList = ['table'];
	var filterStr = current.filter;
	var tableName = current.source;
	var gqs = new GlideQueryString(tableName, filterStr);
	gqs.deserialize();
	var termList = gqs.getTerms();
	if (!gs.nil(termList)) {
		for (var i = 0;i < termList.size();i++) {
			var field = termList.get(i).getField() + "";
			if (blockedList.includes(field)) {
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage("{0} is not allowed to set as a filter field", field));
			}
		}
	}
	

})(current, previous);
