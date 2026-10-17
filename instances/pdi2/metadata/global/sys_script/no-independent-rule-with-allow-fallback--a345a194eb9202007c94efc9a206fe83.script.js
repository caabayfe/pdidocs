(function(){
	var gr = new GlideRecord('cmdb_identifier_entry');
	gr.addQuery('identifier', current.sys_id);
	gr.addQuery('allow_fallback', 'true');
	gr.query();
	if(gr.getRowCount() > 0) {
		gs.addInfoMessage(gs.getMessage("Independent rule cannot have any identifier entries with Allow fallback to parent flag set!"));
		current.setAbortAction(true);
	}
})();
