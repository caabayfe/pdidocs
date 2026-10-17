(function refineQuery(current, parent) {
	
	current.addQuery('source', 'IN', (new sn_aisearch_global.AISMigrationUtils()).getDataSourcesToIndex());

})(current, parent);
