function confirmAndDeleteStepConfiguration() {

    var sysId = g_form.getUniqueValue();
    var tableName = g_form.getTableName();

    var stepGR = new GlideRecord("sc_service_fulfillment_step");
    stepGR.addQuery('service_fulfillment_step_configuration', sysId);
    stepGR.query();
    if (stepGR.hasNext()) {
        var stepsListURL = "/sc_service_fulfillment_step_list.do?sysparm_query=service_fulfillment_step_configuration=" + sysId;
        var stepsClick = new GwtMessage().getMessage('Show');
        var stepsLink = '<a target="_blank" href=' + stepsListURL + '> ' + stepsClick + '</a>';

        var errMsg = new GwtMessage().getMessage('There are step(s) dependent on this configuration and hence it cannot be deleted. {0}', stepsLink);

        g_form.addErrorMessage(errMsg);
    } else {
        var dlg = new GlideDialogWindow('delete_service_fulfillment_configuration');
        dlg.setTitle(getMessage('Confirmation'));
        dlg.setPreference('sysparm_table_name', tableName);
        dlg.setPreference('sysparm_obj_id', sysId);
        dlg.setPreference('focusTrap', true);
        dlg.render();
    }
}
