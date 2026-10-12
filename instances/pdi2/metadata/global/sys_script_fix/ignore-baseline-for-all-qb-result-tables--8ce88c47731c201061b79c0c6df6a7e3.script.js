(function() {
	gs.log('Adding Ignore Baseline attribute on all existing CMDB Query Builder result tables');
    var grAttr = new GlideRecord('sys_schema_attribute');
    if (!grAttr.get('name', 'ignore_baseline')) {
        gs.error('Ignore Baseline attribute not found');
        return;
    }

    var ignoreBaselineId = grAttr.getValue('sys_id');

    var grResultTables = GlideDBObjectManager.get().getTableExtensions('cmdb_qb_result_base').toArray();
	var tables = [];
	for (var i=0; i < grResultTables.length; i++) {
		tables.push(grResultTables[i]);
	}
    var grDBO = new GlideRecord('sys_dictionary');
    grDBO.addQuery('internal_type', 'collection');
    grDBO.addQuery('name', 'IN', tables);
    grDBO.query();

    while (grDBO.next()) {
        var tableName = grDBO.getValue('name');
        var edSysId = grDBO.getValue('sys_id');

        var grSchema = new GlideRecord('sys_schema_attribute_m2m');
        grSchema.initialize();
        grSchema.setValue('schema', edSysId);
        grSchema.setValue('attribute', ignoreBaselineId);
        if(grSchema.insert()) {
			gs.log('Adding Ignore Baseline attribute to the table: ' + tableName);
		}
    }
})();
