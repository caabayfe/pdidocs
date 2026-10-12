function disableExperimentationFramework() {
    var dialog = new GlideModal("glide_confirm_standard");
    dialog.setTitle(getMessage("Disable Experimentation Framework"));
    dialog.setPreference("title", getMessage("By disabling the experimentation framework, you would be excluded from all active experiments and would not be included in any future experiments. You can always enable again if you choose to. Do you wish to proceed?"));
    dialog.setPreference("defaultButton", "ok_button");
    dialog.setPreference("onPromptComplete", function() {
        disableConfirm();
    });
    dialog.render();
}

function disableConfirm() {
    var ga = new GlideAjax("sn_experiment_core.ExperimentUIService");
    ga.addParam("sysparm_name", "disableExperimentation");
    ga.getXMLAnswer(function(response) {
        if (response === "success") {
            g_list.refresh();
        } else {
            showErrorModal("Failed to disable Experimentation Framework: " + response);
        }
    });
}

function showErrorModal(message) {
    var errorDialog = new GlideModal("glide_info");
    errorDialog.setTitle(getMessage("Error"));
    errorDialog.setPreference("title", message);
    errorDialog.setPreference("defaultButton", "ok_button");
    errorDialog.render();
}
