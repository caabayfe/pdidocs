if(isDuplicate(current))
	current.setAbortAction(true);

function isDuplicate(record) {
	var filters = new GlideRecord('ngbsm_filter');
	filters.addQuery('name', record.name);
	filters.addQuery('user', record.user);
	filters.query();
	return filters.next();
}
