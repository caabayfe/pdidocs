(function refineQuery(current, parent) {

	current.addQuery('topic', 'queue.stats');
	current.addQuery('agent', 'mid.server.' + parent.name);
	current.addQuery('sys_created_on', '>', gs.hoursAgo(3));

})(current, parent);
