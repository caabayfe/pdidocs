function showChangeToBusinessServiceDialog() {
    var id = g_form.getUniqueValue();
    var dialog = new GlideDialogWindow("glide_confirm_standard");
    dialog.setTitle(getMessage("Convert to business service"));
    dialog.setPreference('warning', false);
    dialog.setPreference('title', getMessage("Click OK to convert this service to the cmdb_ci_service_business table."));
    dialog.setPreference('focusTrap', true);
    dialog.setPreference('defaultButton', 'ok_button');
    dialog.setPreference('onPromptComplete', function() {
        onPromptComplete(id);
    });
    dialog.render();
}

function onPromptComplete(id) {
    //----
    var loadingDialog = new GlideDialogWindow("dialog_loading", true);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.setTitle(getMessage('Loading...'));
    loadingDialog.render();
    //----
    var ga = new GlideAjax('global.ChangeSysClassName');
    ga.addParam('sysparm_name', 'changeSysClassName');
    ga.addParam('sysparm_selected_id', id);
    ga.addParam('sysparm_table_label', "cmdb_ci_service");
    ga.addParam('sysparm_sys_class_name', "cmdb_ci_service_business");
    ga.addParam('sysparm_service_classification', "Business Service");
    ga.getXMLAnswer(function(key) {
        loadingDialog.destroy();
        if (key) {
            g_form.addInfoMessage(getMessage("This service is converted to the business service table."));
            location.reload();
        } else {
            g_form.addErrorMessage("Failure ");
        }
    });
}
