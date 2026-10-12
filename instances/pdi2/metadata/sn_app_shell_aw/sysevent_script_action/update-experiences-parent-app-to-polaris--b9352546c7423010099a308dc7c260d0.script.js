
      var AGENT_WORKSPACE_APP_SHELL = "c276387cc331101080d6d3658940ddd2";
var BREADCRUM_APP_SHELL = "e341e22cc32e2010ea04a5a1d840dd02";
var POLARIS_APP_SHELL = "c86a62e2c7022010099a308dc7c26022";
var WORKSPACE_CATEGORY = "afb4e3e173322010f0ca1e666bf6a726";

var before = gs.getSession().getWorkflow();
gs.getSession().setWorkflow(false);

var pageRegRecords = new GlideRecord("sys_ux_page_registry");
pageRegRecords.addNullQuery("parent_app");
var orCondition = pageRegRecords.addQuery("root_macroponent", AGENT_WORKSPACE_APP_SHELL);
orCondition.addOrCondition("root_macroponent", BREADCRUM_APP_SHELL);
pageRegRecords.query();
while (pageRegRecords.next()) {
    pageRegRecords.setValue("parent_app", POLARIS_APP_SHELL);
    pageRegRecords.update();
    var categoryRecord = new GlideRecord("sys_ux_registry_m2m_category");
    categoryRecord.addQuery("page_registry", pageRegRecords.getUniqueValue());
    categoryRecord.query();
    if (!categoryRecord.hasNext()) {
        categoryRecord.initialize();
        categoryRecord.setValue("experience_category", WORKSPACE_CATEGORY);
        categoryRecord.setValue("page_registry", pageRegRecords.getUniqueValue());
        categoryRecord.insert();
    }
}

gs.getSession().setWorkflow(before);
