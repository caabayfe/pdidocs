function onBefore(current, previous) {
	// iterate parents until the root. Check none of the parents is this group
	var parent = current.parent_group;
	while (parent != null) {
		var gr = new GlideRecord("cmdb_ci_service_group");
		gr.get(parent);
		if (gr.isValid()) {
			if (gr.sys_id == current.sys_id) {
                current.setAbortAction(true);
                gs.addInfoMessage(gs.getMessage("A group cannot be the parent of itself"));
			    return;	
			}
		} else {
			return;
		}
		parent = gr.parent_group;
	}
}
