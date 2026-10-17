var grAssignmentDisabled = new GlideRecord("sys_declarative_action_assignment");

// Delete dummy disabled records which have global as table name.
grAssignmentDisabled.addQuery("enabled", false);
grAssignmentDisabled.addQuery("table", 'global');
grAssignmentDisabled.query();
grAssignmentDisabled.deleteMultiple();

grAssignmentDisabled = new GlideRecord("sys_declarative_action_assignment");
grAssignmentDisabled.addQuery("enabled", false);
grAssignmentDisabled.addQuery("table", '!=', 'global');
grAssignmentDisabled.query();

while (grAssignmentDisabled.next()) {
    var immutableTableList = GlideDBObjectManager.get().getTables(grAssignmentDisabled.getValue("table"));
	var tableList = [];
	for (var i = 0; i < immutableTableList.size(); i++)
		tableList.push(immutableTableList.get(i));

	tableList.push("global");
    for (i = 0; i < tableList.length; i++) {
        var grAssignmentEnabled = new GlideRecord("sys_declarative_action_assignment");
        grAssignmentEnabled.addQuery("action_name", grAssignmentDisabled.getValue("action_name"));
        grAssignmentEnabled.addQuery("enabled", true);
        grAssignmentEnabled.addQuery("table", tableList[i]);
        grAssignmentEnabled.query();
        if (grAssignmentEnabled.next()) {
            var grExclusion = new GlideRecord("sys_workspace_declarative_action_exclusion");
            grExclusion.initialize();
            grExclusion.setValue("action_assignment", grAssignmentEnabled.getUniqueValue());
            grExclusion.setValue("table", grAssignmentDisabled.getValue("table"));
            grExclusion.setValue("exclude_self", true);
            grExclusion.setValue("exclude_all_child_tables", true);
            grExclusion.insert();
            break;
        }
    }
    grAssignmentDisabled.deleteRecord();
}
