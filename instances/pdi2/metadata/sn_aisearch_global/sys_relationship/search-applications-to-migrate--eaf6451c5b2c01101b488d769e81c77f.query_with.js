(function refineQuery(current, parent) {

	current.addQuery('sys_id', 'IN', new sn_aisearch_global.AISMigrationUtils().getSearchConfigurationsToMigrate());

})(current, parent);
