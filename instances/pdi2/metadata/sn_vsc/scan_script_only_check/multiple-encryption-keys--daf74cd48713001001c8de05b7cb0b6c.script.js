(function(finding) {

	var encGr = new GlideAggregate('sys_encryption_key');
	encGr.addAggregate('COUNT', 'key_size');
	encGr.groupBy('key_size');
	encGr.query();
	while (encGr.next()) {
		var count = encGr.getAggregate('COUNT', 'key_size');
		if (count > 1) {
			finding.setCurrentSource(encGr);
			finding.increment();
		}
	}

})(finding);
