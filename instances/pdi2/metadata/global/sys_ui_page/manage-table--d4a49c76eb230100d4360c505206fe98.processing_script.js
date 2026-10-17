response.sendRedirect(buildURL(table_name));

function buildURL(tableName) {
	var url = 'sys_dictionary.do?'
		+ '&sys_id=' + getDictionaryEntryID(tableName);
	
	return url;
}

function getDictionaryEntryID(tableName) {
	var dictionaryEntryID = '';
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', tableName);
	gr.addQuery('internal_type', 'collection');
	gr.query();
	if (gr.next())
  	dictionaryEntryID = gr.sys_id;
	
	return dictionaryEntryID;
}
