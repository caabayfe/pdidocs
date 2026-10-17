function onBefore(current, previous) {
	var fileName = current.name;
	
	// Space check on file names
	if(fileName.indexOf(' ') !== -1) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Spaces are not allowed on file name"));
	}
	// Colon check on file names
	if(fileName.indexOf(':') !== -1) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Colon ':' is not allowed on file name "));
	}
	
	if(fileName.indexOf("../") !== -1 || fileName.indexOf("..\\") !== -1) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Relative path is not allowed on file name "));									  
	}
	
	// Duplicate file name check
	var gr = new GlideRecord('ecc_agent_script_file');
	gr.addQuery('name', fileName);
	gr.addQuery('parent', current.parent);
	if( current.operation() == "update" ) {
		gr.addQuery('sys_id', '!=', current.getUniqueValue());
	}
	gr.query();
	
	if(gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Duplicate file name is not allowed "));
	}
}
