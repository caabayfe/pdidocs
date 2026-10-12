(function executeRule(current, previous /*null when async*/) {

	if(current.leaf_node) {
		if(current.parent) {
			//if parent of leaf node has no other children, make it leaf
			var children = new GlideRecord("cmdb_ci_business_capability");
			children.addQuery("parent", current.parent);
			children.query();
			if(children.getRowCount() == 1) {
				var gr = new GlideRecord("cmdb_ci_business_capability");
				gr.get(current.parent);
				gr.setValue("leaf_node", true);
				gr.update();
			}
		}
	}
	else {
		// if leaf node delete
		var msgArray = [];
		msgArray.push(current.name);
		gs.addErrorMessage(gs.getMessage("Cannot delete the {0} Capability as it has child Capabilities/is not a leaf level Capability", msgArray ));
		current.setAbortAction(true);
	}

})(current, previous);
