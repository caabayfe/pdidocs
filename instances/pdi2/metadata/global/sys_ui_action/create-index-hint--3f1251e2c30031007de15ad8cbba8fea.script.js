var query = current.sys_query_pattern.getRefRecord();

// Get table and correlation name (e.g. 'task' and 'task0')
var correlationName = current.getValue('table');
var tableName = correlationName;
var suffixIndex = correlationName.search(/\d$/);
if (suffixIndex > -1) {
	tableName = correlationName.substring(0, correlationName.length - 1)
} 

// Look for existing hint
var hint = new GlideRecord('sys_query_index_hint');
hint.addQuery('query_hash', query.hash);
hint.addQuery('table_name', tableName);
hint.addQuery('correlation_name', correlationName);
hint.query();
if (hint.next()) {
	gs.addInfoMessage(gs.getMessage("Opening existing index hint for this query [{0}] and table/correlation [{1}]",[query.hash,tableName]));
} else {
	// Create one and then redirect to it
	hint.initialize();
	hint.example_query = query.example;
	hint.query_hash = query.hash;
	hint.table_name = tableName;
	hint.correlation_name = correlationName;
	hint.active = false;
	var newId = hint.insert();
	hint.get('sys_id', newId);
}
action.setRedirectURL(hint);
