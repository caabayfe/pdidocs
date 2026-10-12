(function refineQuery(current, parent) {

	current.addQuery('hash', parent.getValue('hash'));
	var condition = current.addNullQuery('window_end');
	condition.addOrCondition('window_start', null);
	condition.addOrCondition('window_start.event_type', 'SAMEAS', 'window_end.event_type');

})(current, parent);
