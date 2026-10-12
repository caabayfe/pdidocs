(function refineQuery(current, parent) {

	current.addQuery("definition_id", parent.definition_id);
	current.orderByDesc("time_stamp");

})(current, parent);
