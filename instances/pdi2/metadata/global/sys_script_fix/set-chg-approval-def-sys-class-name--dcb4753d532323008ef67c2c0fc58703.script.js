(function() {
    if (!gs.tableExists("chg_policy_action"))
        return;
    var tableExtensions = GlideDBObjectManager.get().getAllExtensions("chg_policy_action");
    for (var i = tableExtensions.size() - 1; i > -1; i--) {
        var table = tableExtensions.get(i);
		var gr = new GlideRecord(table);
		if (!gr.isValid())
			continue;
		gr.addNullQuery("sys_class_name");
		gr.query();
		while (gr.next()) {
			gr.setValue("sys_class_name", table);
			gr.setWorkflow(false);
			gr.autoSysFields(false);
			gr.update();
		}
	}
})();
