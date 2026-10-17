(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('primary_model', parent.getValue('nlu_model'));

})(current, parent);
