(function executeRule(current, previous /*null when async*/) {	
	if (current.operation() == 'insert') {
		insertColumn(current);
	}
	else if (current.operation() == 'delete') {
		deleteColumn(current);
	}
	else if (current.name.changes()) {
		/**
			Not able to rename an existing column, so that delete the existing one and create a new one
		**/
		deleteColumn(previous);
		insertColumn(current);
	}
	
	function insertColumn(contextRecord) {
		var virtualColumnName = new sn_cs.InteractionContext().getVirtualColumnName(contextRecord.getValue('script_variable'));
		if (isDuplicateField(virtualColumnName))
		    return;
		var dictGr = new GlideRecord('sys_dictionary');
		dictGr.setValue('name', 'v_interaction_context');
		dictGr.setValue('element', virtualColumnName);
		dictGr.setValue('max_length', 100);
		dictGr.setValue('column_label', contextRecord.getValue('name'));
		dictGr.insert();
	}
	
	function deleteColumn(contextRecord) {
		var virtualColumnName = new sn_cs.InteractionContext().getVirtualColumnName(contextRecord.getValue('script_variable'));
		var dictGr = new GlideRecord('sys_dictionary');
		dictGr.addQuery('name', 'v_interaction_context');
		dictGr.addQuery('element', virtualColumnName);
		dictGr.query();
		if (dictGr.next()) {
			dictGr.deleteRecord();
		}
	}

      function isDuplicateField(virtualColumnName) {

          var dictGr = new GlideRecord('sys_dictionary');
          dictGr.addQuery('name', 'v_interaction_context');
          dictGr.addQuery('element', virtualColumnName);
          dictGr.query();
          if (dictGr.next()) {
              return true;
          }

          return false;
      }

})(current, previous);
