function optOutOfExperiment() {
    var dialog = new GlideModal("glide_confirm_standard");
    dialog.setTitle(getMessage("Opt Out of Experiment"));
    dialog.setPreference("title", getMessage("By opting out of the experiment, you would not have your users have different variants and everyone would be viewing the version of app that the product defaults to. You can always opt back into the experiment. Do you wish to proceed?"));
    dialog.setPreference("onPromptComplete", function() {
        gsftSubmit(null, g_form.getFormElement(), 'opt_out');
    });
    dialog.render();
}

function optOutExperiment() {
    current.setValue("opt_out", "true");
    current.update();
    gs.addInfoMessage(gs.getMessage("Experiment opted out successfully."));
    action.setRedirectURL(current);
}

if (typeof window === 'undefined') {
    optOutExperiment();
}
