var UnreferencedRecordCleanerAllowedTableList = Class.create();
UnreferencedRecordCleanerAllowedTableList.prototype = {
    process: function() {
        var out = [];
        var includedTables = GlidePropertiesDB.get("glide.db.unreferenced_record_cleaner.enabled_tables", "");

        if (includedTables && includedTables != "all") {
            var tables = includedTables.split(",");
            for (var i = 0; i < tables.length; i++) {
                var tableName = tables[i].trim();
                if (!SncTableRotationExtensions.isRotationExtension(tableName) &&
                    !SncTableRotationExtensions.isRotated(tableName)) {

                    var td = GlideTableDescriptor.get(tableName);
                    if (!td.isDataFabricTable()) {
                        out.push(tableName);
                    }
                }
            }
            return out;
        }

		var disabledTables = GlidePropertiesDB.get("glide.db.unreferenced_record_cleaner.disabled_tables", "");
        var advancedEnabled = GlidePropertiesDB.get("glide.db.unreferenced_record_cleaner.enable_advanced_ui", "false");

		var tablesGr = new GlideRecord('sys_dictionary');
		tablesGr.addQuery('internal_type','collection');
		tablesGr.addQuery('name', 'NOT LIKE', 'sys_ui%');
		tablesGr.addQuery('name', 'NOT LIKE', 'sys_metadata%');
		var allTablesQuery = tablesGr.addQuery('name', 'NOT IN', disabledTables);

		var subQueryAttributes = new GlideSubQuery('sys_dictionary', 'sys_id', 'sys_id');
        subQueryAttributes.addCondition('attributes', 'LIKE', '%update_synch=false%')
                .addOrCondition('attributes', 'NOT LIKE', '%update_synch%')
                .addOrCondition('attributes', 'ISEMPTY', '');
        var subQueryReferenceColumnExists = new GlideSubQuery('sys_dictionary', 'name', 'name');
        subQueryReferenceColumnExists.addCondition('internal_type', 'reference')
                .addOrCondition('internal_type', 'document_id');
        var sysIdColumnCheck = new GlideSubQuery('sys_dictionary', 'name', 'name');
        sysIdColumnCheck.addCondition('element', 'sys_id');

        allTablesQuery.addCondition(subQueryAttributes);
        allTablesQuery.addCondition(sysIdColumnCheck);
		if (advancedEnabled == "false") {
			allTablesQuery.addCondition(subQueryReferenceColumnExists);
		}

		tablesGr.query();
		var list = new Array();
		while(tablesGr.next()) {
			var tableName = tablesGr.getValue('name');
			if (SncTableRotationExtensions.isRotationExtension(tableName) || SncTableRotationExtensions.isRotated(tableName)) {
				continue;
			}
			var td = GlideTableDescriptor.get(tableName);
			if (td.isDataFabricTable())
				continue;
			list.push(tableName);
		}
		return list;
    },

    type: 'UnreferencedRecordCleanerAllowedTableList'
};
