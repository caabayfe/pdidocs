(function executeRule(current, previous /*null when async*/) {
	var paths = current.paths.split(',');
	var gr = new GlideRecord('sys_graphql_resolver_mapping');
	gr.addQuery('schema', current.sys_id);
	gr.query();
	
	var invalidMappings = [];
	
	while(gr.next()) {
		var currPath = gr.getValue('path');
		if(paths.indexOf(currPath) === -1) {
			invalidMappings.push(currPath);
		}
	}

	if(invalidMappings.length !== 0) {
		gs.addErrorMessage(gs.getMessage("Following mappings are invalid: {0}", GlideStringUtil.escapeHTML(invalidMappings)));
	}

})(current, previous);
