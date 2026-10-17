(function refineQuery(current, parent) {

	current.addQuery('window_start', parent.getUniqueValue());
	var condition = current.addNullQuery('window_end');
	condition.addOrCondition('window_end.event_type', parent.getValue('event_type'));

})(current, parent);
