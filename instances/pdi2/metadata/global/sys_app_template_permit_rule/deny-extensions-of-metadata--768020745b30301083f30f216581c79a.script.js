(function (/*String */ sysId) {
	//Check if the app includes any tables that are in the sys_metadata hierarchy
	var tables = new GlideRecord('sys_db_object');
	tables.query('sys_scope', sysId);

	while (tables.next()) {
		var tableName = tables.getValue('name');

		if (GlideDBObjectManager.get().isMetadataExtension(tableName)) {
			return 'deny';
		}
	}
	return 'allow';
})(sysId);
