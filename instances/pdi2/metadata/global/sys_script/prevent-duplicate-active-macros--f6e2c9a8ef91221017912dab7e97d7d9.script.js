(function executeRule(current, previous /*null when async*/) {
	
	if (!current.active)
		return;
	
	var gr = new GlideRecord('sys_ui_macro');
	gr.addQuery("name", current.name);
	gr.addQuery('media_type', current.media_type);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addActiveQuery();
	gr.query();
	if (gr.hasNext()){
		var msg = gs.getMessage("An active UI Macro with this name and media type already exists.");
		gs.addInfoMessage(msg);
		// prevent active duplicately named  macros 
		current.setAbortAction(true);

	}
})(current, previous);
