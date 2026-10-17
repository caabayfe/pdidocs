var TableCleanerList = Class.create();
TableCleanerList.prototype = {
    process: function() {
		var tableCleanerEnabledRec = new GlideRecord('sys_dictionary');
		var allTablesQuery = tableCleanerEnabledRec.addQuery('internal_type','collection');

		var subQuery = new GlideSubQuery('sys_dictionary', 'sys_id', 'sys_id');
		subQuery.addCondition('attributes', 'LIKE', '%disableTableCleaner=false%')
				.addOrCondition('attributes', 'NOT LIKE', '%disableTableCleaner%')
				.addOrCondition('attributes', 'ISEMPTY', '');
		
		allTablesQuery.addCondition(subQuery);
		
		tableCleanerEnabledRec.query();
		var list = new Array();

		while(tableCleanerEnabledRec.next()) {
		  var tableName = tableCleanerEnabledRec.getValue('name');

		  if (SncTableRotationExtensions.isRotationExtension(tableName) || SncTableRotationExtensions.isRotation(tableName))
              continue;

          var td = GlideTableDescriptor.get(tableName);
          if (td.isDataFabricTable())
              continue;

          list.push(tableName);
		}
		return list;
    },

    type: 'TableCleanerList'
};
