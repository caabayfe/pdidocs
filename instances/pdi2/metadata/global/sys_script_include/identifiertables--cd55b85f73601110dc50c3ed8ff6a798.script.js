var IdentifierTables = Class.create();
IdentifierTables.prototype = {
    initialize: function() {
    },
	
	process : function() {
		var result = [];
		var lookupTableScript = new IdentificationLookUpTables();
		
		// get non cmdb tables from property
		var nonCmdbTablesStr = gs.getProperty('glide.identification_engine.non_cmdb_tables', '');
		
		var allowedTables = nonCmdbTablesStr.split(',');
		allowedTables.push('cmdb_ci'); // add all cmdb tables to allowed tables
		
		// add all non cmdb tables from the property and cmdb tables to the result
		for (i = 0; i < allowedTables.length; i++) {
			// add the table to the result list, then add all its children to the result
			result.push(allowedTables[i]);
			var children = this._getAllTableExtensions(allowedTables[i]);
			result = result.concat(children);
		}
		
		// add all scoped app tables
		var gr = new GlideRecord('sys_db_object');
		// exclude global tables and tables with no scope
		gr.addEncodedQuery('sys_scope!=global^sys_scope!=NULL');
		gr.query();
		
		while(gr.next()) {
			var name = gr.getValue('name');
			if (!GlideStringUtil.nil(name)) {
				result.push(name);
			}
		}
		
		result = lookupTableScript.filterTable(result);
		return result;
	},
	
	_getAllTableExtensions : function(table) {
		var result = [];
		var extensions = j2js(new TableUtils(table).getTableExtensions());
		for (var i = 0; i < extensions.length; i++) // add all child types
                result.push(extensions[i]);
		return result;
	},
	
    type: 'IdentifierTables'
};
