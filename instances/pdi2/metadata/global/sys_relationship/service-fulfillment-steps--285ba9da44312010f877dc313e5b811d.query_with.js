
		(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addNotNullQuery('service_fulfillment_stage');
	current.addQuery('service_fulfillment_stage.cat_item', parent.getUniqueValue());

})(current, parent);
