var upgradeTool = new sn_scmobile.CatalogMobileUpgradeTools();
upgradeTool.cleanUpgradeCardViews();
upgradeTool.cleanUpgradeInputFormScreen();

//De activate the script once it is completed the execution

var gr = new GlideRecord("sysevent_script_action");
gr.addQuery("sys_id", "a58e03ca771a111059018f1a5b5a99f9");
gr.query();
if (gr.next()) {
    gr.setValue("active", false);
    gr.update();
}
