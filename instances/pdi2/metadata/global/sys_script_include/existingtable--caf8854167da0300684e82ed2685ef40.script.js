var ExistingTable = Class.create();
ExistingTable.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isExistingTable: function() {
		var tableName =this.getParameter('sysparm_table_name');
		return gs.tableExists(tableName);
	},
	
	type: 'ExistingTable'
});
