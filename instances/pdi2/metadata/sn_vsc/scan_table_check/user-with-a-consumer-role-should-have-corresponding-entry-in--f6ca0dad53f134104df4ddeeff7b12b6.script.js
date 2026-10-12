(function (finding, current) {
	var consumer = new GlideRecord('csm_consumer');
	if (consumer.isValid()) {
		consumer.addQuery('user', current.user);
		consumer.query();
		if (!consumer.next()) {
			finding.setCurrentSource(current);
			finding.increment();
		}
	}
})(finding, current);
