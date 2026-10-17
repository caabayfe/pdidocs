function onAfter(current, previous) {
	//This function will be automatically called when this rule is processed.
	var lengthInUserTable = current.max_length;
	var lengthInSessionTable = getMaxLength('sys_user_session', 'name');
	var lengthInTokenTable = getMaxLength('sys_user_token', 'name');

	if (lengthInSessionTable < lengthInUserTable) {
		fixMaxLength('sys_user_session', 'name', lengthInUserTable);
		gs.print ('User Name field length changed from ' + lengthInSessionTable + ' in session table to ' + lengthInUserTable);
	} else {
		gs.print ('User Name field length in session table is greater than or equal to user table');
	}

	if (lengthInTokenTable < lengthInUserTable) {
		fixMaxLength('sys_user_token', 'name', lengthInUserTable);
		gs.print ('User Name field length changed from ' + lengthInTokenTable + ' in token table to ' + lengthInUserTable);
	} else {
		gs.print ('User Name field length in token table is greater than or equal to user table');
	}
}

function getMaxLength(tableName, columnName) {
	var maxLength = 0;
	var dictGR = new GlideRecord('sys_dictionary');
	dictGR.initialize();
	dictGR.addQuery('name', tableName);
	dictGR.addQuery('element', columnName);
	dictGR.addActiveQuery();
	dictGR.query();
	if (dictGR.next() && dictGR.max_length != null) {
		maxLength = dictGR.max_length;
	}
	return maxLength;
}

function fixMaxLength(tableName, columnName, newLength) {
	var dictGR = new GlideRecord('sys_dictionary');
	dictGR.initialize();
	dictGR.addQuery('name', tableName);
	dictGR.addQuery('element', columnName);
	dictGR.addActiveQuery();
	dictGR.query();
	if (dictGR.next()) {
		dictGR.max_length = newLength;
		dictGR.update();
	}	
}
