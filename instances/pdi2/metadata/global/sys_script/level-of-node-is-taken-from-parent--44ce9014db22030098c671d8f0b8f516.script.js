(function executeRule(current, previous /*null when async*/) {
	var msg = "";
	var msgArray = [];
	if(current.parent ) {
		if(current.parent.hierarchy_level >=0) {
			if(current.parent.hierarchy_level == 5) {
				msgArray = [];
				msgArray.push(current.name);
				msgArray.push(current.parent.name);
				gs.addErrorMessage(gs.getMessage("Capability Hierarchy up to level-5 is only supported. Cannot add the {0} Capability as a child of {1} Capability which results in level-6 capability.", msgArray));
				current.setAbortAction(true);
			}
			else {
				current.hierarchy_level = current.parent.hierarchy_level + 1;
				var parent = new GlideRecord("cmdb_ci_business_capability");
				parent.get(current.parent);
				parent.setValue("leaf_node",false);
				parent.update();
			}
		}
		else {
			msgArray = [];
			msgArray.push(current.name);
			msgArray.push(current.parent.name);
			msgArray.push('Update Business Capability Levels and Hierarchy IDs');
			gs.addErrorMessage(gs.getMessage("Cannot add the {0} Capability as a child of {1} Capability since the 'Level' of {1} Capability is not defined. Run the job '{2}' and add the Capability.", msgArray));
			current.setAbortAction(true);
		}
	}
	else
		current.hierarchy_level = 0;
	current.leaf_node = true;

})(current, previous);
