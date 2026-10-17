var scriptPrefix = "fix_migrate_clear_value_actions";

gs.info(scriptPrefix + "Started executing the script");
moveClearValueData();
gs.info(scriptPrefix + "Ended executing the script");

function moveClearValueData() {
    var clearValueTypes = ['25', '33'];
    var variableIds = [];
    var clearValueVariableIds = [];
    var gr1 = new GlideRecord("catalog_ui_policy_action");
    gr1.setWorkflow(false);
    gr1.get("cleared", true);
    while (gr1.next())
        variableIds.push(gr1.getValue("catalog_variable").substring(3));

    var variable = new GlideRecord("item_option_new");
    variable.addQuery("sys_id", variableIds);
    variable.addQuery("type", clearValueTypes);
    variable.setWorkflow(false);
    variable.query();
    while (variable.next())
        clearValueVariableIds.push("IO:" + variable.getUniqueValue());

    var gr = new GlideRecord("catalog_ui_policy_action");
    gr.addQuery("cleared", true);
    gr.addQuery("catalog_variable", "NOT IN", clearValueVariableIds);
    gr.setWorkflow(false);
    gr.setValue("value_action", "clear_value");
    gr.setValue("cleared", "");
    gr.setWorkflow(false);
	// Skip updating the version field
    GlideTransaction.get().setAttribute("catalog_wizard_origin", "default");
    gr.updateMultiple();
}

//Deactivate the script action after first run
var action = new GlideRecord("sysevent_script_action");
if (action.get("34878d54777131101a80bebc9f5a9961")) {
	action.setValue("active", false);
	action.update();
}
