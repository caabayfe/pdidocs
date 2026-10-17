(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addEncodedQuery("owner=" + parent.getValue("provider"));
	current.orderBy("number");

})(current, parent);
