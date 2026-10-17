var TablesSchemaHelper = Class.create();
TablesSchemaHelper.prototype = {
    initialize: function() {
        this._licensingEngineTableDescriptor = new global.LicensingEngineTableDescriptor();
        this._tableInfoService = new TableInfoService();
    },

    getRelatedTables: function(tableName) {
        //get ancestor table
        var relatedTables = this._tableInfoService.getTableHierarchy(tableName);
        //get reference tables
        return relatedTables.concat(this._licensingEngineTableDescriptor.getReferencedTables(tableName));
    },

	isvalidTable : function(tableName){
		return this._licensingEngineTableDescriptor.isValid(tableName);
	},

    type: 'TablesSchemaHelper'
};
