function optInToExperiment() {
    var dialog = new GlideModal("glide_confirm_standard");
    dialog.setTitle(getMessage("Opt In to Experiment"));
    dialog.setPreference("title", getMessage("By opting in to the experiment, you are choosing to be part of the variants. As you see in the details, your users would be part of different variants. Do you wish to proceed?"));
    dialog.setPreference("onPromptComplete", function() {
        gsftSubmit(null, g_form.getFormElement(), 'opt_in');
    });
    dialog.render();
}

function optInExperiment() {
    current.setValue("opt_out", "false");
    current.update();
    gs.addInfoMessage(gs.getMessage("Experiment opted in successfully."));
    action.setRedirectURL(current);
}

if (typeof window === 'undefined') {
    optInExperiment();
}
