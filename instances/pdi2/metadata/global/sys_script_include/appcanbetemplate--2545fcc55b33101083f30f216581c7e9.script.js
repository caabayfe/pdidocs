var AppCanBeTemplate = Class.create();
AppCanBeTemplate.prototype = {
    check: function(app_id) {
		
		//Check if the app includes any tables that are in the sys_metadata hierarchy
		var tables = new GlideRecord('sys_db_object');
		tables.query('sys_scope', app_id);
		
		while (tables.next()) {
			var tableName = tables.getValue('name');
			
			if (GlideDBObjectManager.get().isMetadataExtension(tableName)) {
				return false;
			}
		}
		
		//Check if the app includes any template metadata
		var metadata = new GlideAggregate('sys_metadata');
		metadata.addAggregate('COUNT');
		
		metadata.addQuery('sys_scope', app_id);
		metadata.addQuery('sys_class_name', 
						'IN', 'sys_app_template,sys_app_scan_payload,sys_app_scan_variable');
		metadata.query();
		
		var count = 0;
		if (metadata.next()) {
			count = metadata.getAggregate('COUNT');
		}
		
		
		
		return count == 0;
    },

    type: 'AppCanBeTemplate'
};
