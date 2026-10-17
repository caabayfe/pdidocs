(function executeRule(current, previous /*null when async*/) {
	//Todo Remove this BR once we have fix of flushsourceids limit for multirowput
	UDCCache.flush('File Taxonomy Structure', 'file_taxonomy_structure');
})(current, previous);
