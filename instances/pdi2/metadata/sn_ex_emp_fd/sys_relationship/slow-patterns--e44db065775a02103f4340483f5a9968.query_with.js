(function refineQuery(current, parent) {
	// Add your code here, such as current.addQuery(field, value);
	current.addEncodedQuery("urlLIKE"+parent.caller_id);
})(current, parent);
