function sys_trigger_system_idGetChoices() {
	try {
		// if g_sys_trigger_sys_id_choices exists, it is a ChoiceList Java object,
		// so doing a "typeof" on it throws an error. Instead, try to compare it to something.
		// if we error, fall out of this TRY block and do the GlideRecord query.
		// if we don't error, use the ChoiceList we already built in a previous call into this function
		if (g_sys_trigger_sys_id_choices != "something") {
			for (var i = 0; i < g_sys_trigger_sys_id_choices.size(); i++) {
				var choice = g_sys_trigger_sys_id_choices.get(i);
				answer.add(choice.getValue(), choice.getLabel());
			}
			return;
		}
	} catch(e) {
	}
	var allNodesLabel = gs.getMessage("All Nodes");
        var primaryNodesLabel = gs.getMessage("Primary Nodes");
        var activeNodesLabel = gs.getMessage("Active Nodes");

	answer.add("ALL NODES", allNodesLabel);
	answer.add("PRIMARY NODES", primaryNodesLabel);
	answer.add("ACTIVE NODES", activeNodesLabel);
	var nd = new GlideRecord("sys_cluster_state");
	nd.query();
	while (nd.next())
		answer.add(nd.system_id, nd.system_id);
	
	g_sys_trigger_sys_id_choices = new GlideChoiceList();
	g_sys_trigger_sys_id_choices = answer;
}
