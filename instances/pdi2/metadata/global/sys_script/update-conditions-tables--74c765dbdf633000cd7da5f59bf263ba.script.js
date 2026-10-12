updateConditionsTables();

function updateConditionsTables() {
	var condTables = ["cert_attr_cond", "cert_ci_rel_cond", "cert_group_rel_cond", "cert_user_rel_cond", "cert_related_list_cond"];
	// Have to visit tables individually otherwise 
	// condition business rules will not work properly

	var numTables = condTables.length;
	for (var i = 0; i < numTables; i++) {
		var condTable = condTables[i];
		var gr = new GlideRecord(condTable);
		gr.addQuery('cert_template', current.getUniqueValue());
		gr.query();
		while (gr.next()) {
			gr.table = current.table;
			setCondition(gr);
			gr.setWorkflow(false);
			gr.update();
			gr.setWorkflow(true);
		}
	}	
}

function setCondition(currentRecord) {
	var conditionNull = currentRecord.condition.nil();
	var tableNull = currentRecord.table.nil();

    if (conditionNull) {
        // set the display to empty
        currentRecord.condition_display = '';
        currentRecord.desired_value = '';
        currentRecord.column_name = '';
        currentRecord.column_display_name = '';
        currentRecord.op_label = '';
        return;
    }
	
	var conditionValue = currentRecord.condition;
	
	var prettyQuery = '';
	var condTableName = currentRecord.getTableName().toString();
	// If this is an attribute condition
	// and the table is set, parse as normal condition query
	if ((condTableName == 'cert_attr_cond' || condTableName == 'cert_related_list_cond') && !tableNull) {
		var result = (new SNC.ConditionUtils()).getQueryTerms(conditionValue, (condTableName == 'cert_related_list_cond')? currentRecord.join_table : currentRecord.table);
		result = (new JSONParser()).parse(result);
		var terms = result.terms;
		prettyQuery = (condTableName == 'cert_related_list_cond')? '' : result.queryDisplay;
		// If this was a one line query, set the desired value,
		// the column name, the display name, and the operator
		if (terms.length == 1) {
			currentRecord.desired_value = terms[0].valueDisplay;
			currentRecord.column_name = terms[0].columnName;
			currentRecord.column_display_name = terms[0].columnLabel;
			currentRecord.op_label = terms[0].operatorDisplay;
		}
	}
	else {
		var relTypeTable = null;
		var relTargetTable = null;
		
		switch (currentRecord.getTableName().toString()) {
			case 'cert_ci_rel_cond':
				relTypeTable = 'cmdb_rel_type';
				relTargetTable = 'cmdb_ci';
				break;
			case 'cert_user_rel_cond':
				relTypeTable = 'cmdb_rel_user_type';
				relTargetTable = 'sys_user';
				break;
			case 'cert_group_rel_cond':
				relTypeTable = 'cmdb_rel_group_type';
				relTargetTable = 'sys_user_group';
				break;
		}
		// Update condition to look like {descriptor}:[targetTable:]{query}
		var modCondition = currentRecord.descriptor + ':';
		if(relTargetTable == 'cmdb_ci')
			modCondition += conditionValue;
		else
			modCondition += relTargetTable + ':' + conditionValue;
		
		// If this is a relationship condition, parse
		// as relationship query
		if (relTypeTable != null && relTargetTable != null) {
			var result = (new SNC.ConditionUtils()).getRelationshipQueryTerms(modCondition, relTypeTable, relTargetTable);
			result = (new JSONParser()).parse(result);
			var terms = result.terms;
			prettyQuery = result.queryDisplay;
			// If this was a one line query, set the desired value,
			// the column name, the display name, and the operator
			if (terms.length == 1) {
				currentRecord.desired_value = terms[0].targetDisplay;
				currentRecord.column_name = terms[0].relationshipId;
				currentRecord.column_display_name = terms[0].relationshipLabel;
				currentRecord.op_label = terms[0].operatorDisplay;
			}
		}
	}
	// Update the condition display to be the 
	// human readable query
	if (prettyQuery != '')
		currentRecord.condition_display = prettyQuery;
}
