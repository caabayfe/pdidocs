(function() {
	if (pm.isZboot())
		return;

	if (GlideDBObjectManager.get().isMetadataExtension("sys_ux_m2m_workspace_view_rule_ux_view_rule_config")) {
		gs.log('sys_ux_m2m_workspace_view_rule_ux_view_rule_config already extends sys_metadata. Skipping table reparenting');
		return;
	}

	try {
		var tpc = new GlideTableParentChange("sys_ux_m2m_workspace_view_rule_ux_view_rule_config");
		tpc.change("", "sys_metadata");
	} catch (e) {
		gs.warn("Table parent change for child_table did not complete. Error: {0}", e);
	}
})();
