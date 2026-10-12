
if (hasTableEntryAlready()) 
	abortInsert();

function hasTableEntryAlready() {
    var grx = new GlideRecord('stage_set_table');
	return grx.get('table', current.table);	
}

function abortInsert() {
	var emsg = gs.getMessage('Table {0} already has a default stage set.', current.table.label);
    gs.addInfoMessage(emsg);
	current.table.setError(emsg);
	current.setAbortAction(true);
}
