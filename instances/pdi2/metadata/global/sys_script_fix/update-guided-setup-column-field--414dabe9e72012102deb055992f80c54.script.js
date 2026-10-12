function updateInteractionStatusCalculation() {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "help_guidance");
    gr.addQuery("element", "interaction_status");
    gr.query();
    if (gr.next()) {
        gr.setValue("calculation", "(function calculatedFieldValue(current) { var process_sys_id = current.process_definition; if (process_sys_id) { var playerController = new sn_ads_setup.SNHelpSetupPlayerController(); return playerController.getInteractionStatus(current.getUniqueValue()); } else { return current.interaction_status; } })(current);");
        gr.setWorkflow(false);
        gr.update();
    }
}

function setDefaultValueForSysDomainPathColumn(table) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery('name', table);
    gr.addQuery("element", "sys_domain_path");
    gr.query();
    gs.info(gr.getRowCount());
    if (gr.next()) {
        gr.setValue("default_value", "/");
        gr.setWorkflow(false);
        gr.update();
    }
}

updateInteractionStatusCalculation();
setDefaultValueForSysDomainPathColumn('help_guidance');
setDefaultValueForSysDomainPathColumn('help_user_interaction');
setDefaultValueForSysDomainPathColumn('help_user_interaction_step');
