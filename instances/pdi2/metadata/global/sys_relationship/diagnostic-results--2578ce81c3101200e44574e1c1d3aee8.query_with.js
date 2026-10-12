(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('item', parent.item);
	current.addQuery('timestamp', parent.timestamp);

})(current, parent);
