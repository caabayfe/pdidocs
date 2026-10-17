(function refineQuery(current, parent) {

	current.addQuery("preview", parent.getUniqueValue());
	current.addQuery("resolution", "IN", "reviewed,retained,reverted");
	current.addQuery("disposition", "IN", "4,5,10"); // 4 = Predicted Skip, 5 = Reverted, 10 = Predicted Skip (Manual Merge)

})(current, parent);
