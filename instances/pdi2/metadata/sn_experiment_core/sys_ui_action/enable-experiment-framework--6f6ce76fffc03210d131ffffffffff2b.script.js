function enableExperimentationFramework() {

    var dialog = new GlideModal("glide_confirm_standard");

    dialog.setTitle(getMessage("Enable Experimentation Framework"));

    dialog.setPreference("title", getMessage("By enabling the experimentation framework, you would be part of all active experiments and will be included in all future experiments. You can always disable again if you choose to. Do you wish to proceed?"));

    dialog.setPreference('defaultButton', 'ok_button');
    dialog.setPreference('onPromptComplete', function() {
        enableConfirm();
    });

    dialog.render();
}

function enableConfirm() {
    var ga = new GlideAjax("sn_experiment_core.ExperimentUIService");
    ga.addParam("sysparm_name", "enableExperimentation");
    ga.getXMLAnswer(function(response) {
        if (response === "success") {
            g_list.refresh();
        } else {
            showErrorModal("Failed to enable Experimentation Framework: " + response);
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
