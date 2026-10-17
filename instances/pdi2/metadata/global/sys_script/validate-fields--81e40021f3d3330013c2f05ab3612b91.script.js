(function executeRule(current, previous /*null when async*/) {

	function isDuplicatedAPIInScope(sysScope, api) {
		var gr = new GlideRecord("sys_aw_registered_scripting_modal");
			gr.addQuery("api", api);
			gr.addQuery("sys_scope", sysScope);
			if (!current.isNewRecord())
				gr.addQuery('sys_id','!=',current.sys_id);
			gr.query();
			return gr.next();
	}
	
	function isDuplicatedComponentInScope(sysScope, component) {
		var gr = new GlideRecord("sys_aw_registered_scripting_modal");
			gr.addQuery("component", component);
			gr.addQuery("sys_scope", sysScope);
			if (!current.isNewRecord())
				gr.addQuery('sys_id','!=',current.sys_id);
			gr.query();
			return gr.next();
	}
	
	var api = current.getValue("api");
	var component = current.getValue("component");
	var sysScope = current.getValue("sys_scope");
	var error = '';
	
	if (!component) {
		error = gs.getMessage("{0} field is required.", current.getElement('component').getLabel());
	} else if (!api) {
		error = gs.getMessage("{0} field is required.", current.getElement('api').getLabel());
	} else {
		 var invalid = !(/^[a-z][a-zA-Z_0-9]+$/.test(api)) || api.length < 2 || api.length > 20;
		 if (invalid)
			 error = gs.getMessage("{0} field value must be in alphanumeric characters but not start with number characters, and length should be between 2-20 characters long.", current.getElement('api').getLabel());
		else {
			if (isDuplicatedAPIInScope(sysScope, api))
				error = gs.getMessage("The {0} name already exists in scope {1}.", current.getDisplayValue('api'), current.getDisplayValue('sys_scope'));
			else if (isDuplicatedComponentInScope(sysScope, component))
				error = gs.getMessage("An API for Component {0} already exists in scope {1}.", current.getDisplayValue("component"), current.getDisplayValue("sys_scope"));
		}
	}
	
	if (error) {
		gs.addErrorMessage(error);
		current.setAbortAction(true);
	} 
	
})(current, previous);
