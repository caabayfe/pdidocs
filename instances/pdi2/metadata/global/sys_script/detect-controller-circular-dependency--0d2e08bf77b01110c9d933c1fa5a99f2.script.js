(function executeRule(current, previous /*null when async*/) {
	/*
	This script traverses the dependency tree using depth-first search to find circular dependencies for the UI Controller             Macroponent
	*/

	var traversed = {};
	detectDependency(current, 1);

	function detectDependency(curr, level){
		if(traversed[curr.sys_id]){
			gs.addErrorMessage(gs.getMessage("Circular dependency detected, please fix before updating record"));
			current.setAbortAction(true);
			return;
		}

		if(level > 20){
			gs.addInfoMessage(gs.getMessage("Maximum dependency level reached, please keep dependency level at 20 or below"));
			current.setAbortAction(true);
			return;
		}

		if(curr.category != "ui_controller") return;

		var dependencies = [];
		try {
			dependencies = curr.ext_controller_dep ? JSON.parse(curr.ext_controller_dep) : [];
		} catch(e) {
			gs.warn("Unable to parse dependencies in the UXF Macroponent", e);
		}
		if(!dependencies) return;

		traversed[curr.sys_id] = true;

		for(var i = 0; i < dependencies.length; i++){
			var sysID = dependencies[i].controllerSysId;
			var gr = new GlideRecord('sys_ux_controller');
			gr.addQuery('sys_id', '=', sysID);
			gr.query();
			while(gr.next()){
				detectDependency(gr.controller_macroponent, level + 1);
				delete traversed[gr.sys_id]; //backtrack for path clean up
			}
		}
	}
})(current, previous);
