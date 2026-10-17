//Only Run when Polaris is Enabled.
if (sn_ui.PolarisUI.isEnabled()) {
    var modules = "application.title=Connect^ORapplication.title=Live Feed^ORtitle=Connect Chat";
    var notifications = "category.name=Connect^ORcategory.name=Live Feed";

    activeRecords('sys_app_module', modules);
    activeRecords('sysevent_email_action', notifications);
}

function activeRecords(table, queryConditions) {
    var gr = new GlideRecord(table);
    gr.addEncodedQuery(queryConditions);
    gr.query();
    gr.setValue('active', "true");
    gr.updateMultiple();
}
