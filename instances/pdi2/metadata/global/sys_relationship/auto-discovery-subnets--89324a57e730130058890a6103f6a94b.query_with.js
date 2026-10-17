(function refineQuery(current, parent) {
	if (parent.location)
		current.addQuery('netgear_location', parent.location);
})(current, parent);
