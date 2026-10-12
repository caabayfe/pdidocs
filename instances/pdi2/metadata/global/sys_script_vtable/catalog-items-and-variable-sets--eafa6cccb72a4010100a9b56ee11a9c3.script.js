(function executeQuery(v_table, v_query) {
	var SYS_CAT_ITEM_TABLE = "sc_cat_item";
	var SYS_ITEM_OPTION_NEW_SET_TABLE = "item_option_new_set";
	var SYS_DOMAIN = "sys_domain";
	var SYS_DOMAIN_PATH = "sys_domain_path";
	var COLUMN_NAME = "name";
	var COLUMN_TYPE = "type";
	var COLUMN_TITLE = "title";
	var EQUALS_STRING = "=";
	var ORDERBY_STRING = "ORDERBY";
	var VARIABLESET_TYPE = "one_to_one";
	var count = 0;

	var encodedQuery = v_query.getEncodedQuery();
	var catItems = new GlideRecordSecure(SYS_CAT_ITEM_TABLE);
	catItems.orderBy(COLUMN_NAME);
	catItems.addEncodedQuery(encodedQuery);
	catItems.query();
	
	while (catItems._next()) {
		if(count > 1000){
			break;
		}
		count++;
		var obj = {};
		obj.name = String(catItems.name);
		obj.sys_id = String(catItems.sys_id);
		obj.data_type = "Catalog item";
		obj.data_source = SYS_CAT_ITEM_TABLE;
		obj.sc_catalogs = catItems.getValue("sc_catalogs");
		if(catItems.isValidField(SYS_DOMAIN)){
			obj.sys_domain = catItems.getValue(SYS_DOMAIN);
			obj.sys_domain_path = catItems.getValue(SYS_DOMAIN_PATH);
		}
		v_table.addRow(obj);
	}

	var conditions = encodedQuery.split("^");
	var i ;
	var variableSetConditions = [];
	for(i=0;i<conditions.length;i++){
		var nameIndex = conditions[i].indexOf(COLUMN_NAME);
		var orderBYIndex = conditions[i].indexOf(ORDERBY_STRING);
		if(nameIndex === 0){
			//In VariableSet column name is title hence appending "title" while removing "name"
			variableSetConditions.push(COLUMN_TITLE + conditions[i].substr(4));
		}else if(orderBYIndex === 0){
			variableSetConditions.push(ORDERBY_STRING + COLUMN_TITLE);
		}
	}
	var variableSetEQ = variableSetConditions[0];
	for(i=1;i<variableSetConditions.length;i++){
		variableSetEQ = variableSetEQ + "^" + variableSetConditions[i];
	}
	var variableSets = new GlideRecordSecure(SYS_ITEM_OPTION_NEW_SET_TABLE);
	variableSets.orderBy(COLUMN_TITLE);
	variableSets.addEncodedQuery(variableSetEQ);
	variableSets.addQuery(COLUMN_TYPE, EQUALS_STRING, VARIABLESET_TYPE);
	variableSets.query();
	
	
	while (variableSets._next()) { 
		if(count > 1000){
			break;
		}
		count++;
		var setObj = {};
		setObj.name = String(variableSets.title);
		setObj.sys_id = String(variableSets.sys_id);
		setObj.data_type = "Variable set";
		setObj.data_source = SYS_ITEM_OPTION_NEW_SET_TABLE;
		if(variableSets.isValidField(SYS_DOMAIN)){
			setObj.sys_domain = variableSets.getValue(SYS_DOMAIN);
			setObj.sys_domain_path = variableSets.getValue(SYS_DOMAIN_PATH);
		}
		v_table.addRow(setObj);
	}
	
})(v_table, v_query);
