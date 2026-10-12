(function executeRule(current, previous /*null when async*/) {
	//Todo Remove this BR once we have fix of flushsourceids limit for multirowput
	if (!FileTaxonomy.isMetadataFile(current?.super_class?.name)) return;
	UDCCache.flush('File Taxonomy Structure', 'file_taxonomy_structure');
})(current, previous);
