(function refineQuery(current, parent) {

	current.addQuery("preview", parent.getUniqueValue());
	current.addQuery("resolution", "IN", "not_reviewed,not_needed");
	current.addQuery("disposition", "IN", "4,10"); // 4 = Predicted Skip, 10 = Predicted Skip (Manual Merge)

})(current, parent);
