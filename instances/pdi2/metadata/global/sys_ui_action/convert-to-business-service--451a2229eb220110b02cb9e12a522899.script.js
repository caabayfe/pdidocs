function showSelectBusinessChangeDialog() {
    var ids = g_list.getChecked().split(",");
    var dialog = new GlideDialogWindow("glide_confirm_standard");
    dialog.setTitle(getMessage("Convert to business service(s)"));
    dialog.setPreference('warning', false);
    dialog.setPreference('title', getMessage("By clicking OK, the service(s) you selected will be moved from this table (cmdb_ci_service) to the business service table (cmdb_ci_service_business). Click OK to continue."));
    dialog.setPreference('focusTrap', true);
    dialog.setPreference('defaultButton', 'ok_button');
    dialog.setPreference('onPromptComplete', function() {
        onPromptComplete(ids);
    });
    dialog.render();
}

function onPromptComplete(ids) {
    //----
    var loadingDialog = new GlideDialogWindow("dialog_loading_1", true);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.setTitle(getMessage('Loading...'));
    loadingDialog.render();
    //----
    var ga = new GlideAjax('global.CheckServiceClass');
    ga.addParam('sysparm_name', 'checkServiceClass');
    ga.addParam('sysparm_selected_id', ids);
    ga.addParam('sysparm_table_label', "cmdb_ci_service");
    ga.addParam('sysparm_service_class_name', "Business Service");
    ga.getXMLAnswer(function(key) {
        loadingDialog.destroy();
        if (key == "true") {
            convertToBusinessService(ids);
        } else {
            var dialog = new GlideDialogWindow("glide_confirm_standard");
            dialog.setTitle(getMessage("Warning"));
            dialog.setPreference('warning', false);
            dialog.setPreference('title', formatMessage(getMessage("{0} of the services you selected are not classified as \"business services.\" Do you wish to continue?"), Math.trunc(key)));
            dialog.setPreference('focusTrap', true);
            dialog.setPreference('defaultButton', 'ok_button');
            dialog.setPreference('onPromptComplete', function() {
                convertToBusinessService(ids);
            });
            dialog.render();
        }
    });
}

function convertToBusinessService(ids) {
    //----
    var loadingDialog = new GlideDialogWindow("dialog_loading_2", true);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.setTitle(getMessage('Loading...'));
    loadingDialog.render();
    //----
    var ga = new GlideAjax('global.ChangeSysClassName');
    ga.addParam('sysparm_name', 'changeSysClassName');
    ga.addParam('sysparm_selected_id', ids);
    ga.addParam('sysparm_table_label', "cmdb_ci_service");
    ga.addParam('sysparm_sys_class_name', "cmdb_ci_service_business");
    ga.addParam('sysparm_service_classification', "Business Service");
    ga.getXMLAnswer(function(key) {
        loadingDialog.destroy();
        if (key) {
            var offeringCount = Math.trunc(key.split(",")[0]);
            var updateCount = Math.trunc(key.split(",")[1]);
            if (!offeringCount) {
                GlideUI.get().addOutputMessage({
                    msg: formatMessage(getMessage("{0} of services are converted to the business service table."), updateCount),
                    type: "info"
                });
                location.reload();
            } else if (updateCount && offeringCount) {
                GlideUI.get().addOutputMessage({
                    msg: formatMessage(getMessage("{0} of services are converted to the business service table."), updateCount),
                    type: "info"
                });
                GlideUI.get().addOutputMessage({
                    msg: getMessage("Offerings cannot be converted to services"),
                    type: "error"
                });
                location.reload();
            } else {
                GlideUI.get().addOutputMessage({
                    msg: getMessage("Offerings cannot be converted to services"),
                    type: "error"
                });
                location.reload();
            }
        } else {
            GlideUI.get().addOutputMessage({
                msg: getMessage("Failure!"),
                type: "error"
            });
        }
    });
}
