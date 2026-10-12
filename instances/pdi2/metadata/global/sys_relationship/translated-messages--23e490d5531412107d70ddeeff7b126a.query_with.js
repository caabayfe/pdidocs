(function refineQuery(current, parent) {
	current.addQuery('code', 'playbook_' + parent.getUniqueValue());
})(current, parent);
