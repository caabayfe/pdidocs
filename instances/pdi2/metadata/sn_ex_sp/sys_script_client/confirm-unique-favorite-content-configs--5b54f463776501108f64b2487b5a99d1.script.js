var gFormAlreadySubmitted = false;

function onSubmit() {
    if (gFormAlreadySubmitted)
        return true;

    var isActive = g_form.getValue("active");
    if(isActive === "true") {
        var ga = new GlideAjax('FavoritesAjax');
        ga.addParam('sysparm_name', 'isDuplicateRecord');
        ga.addParam('sysparm_table', g_form.getValue('table'));
        ga.addParam('sysparm_content_type', g_form.getValue('favorite_content_type'));
        ga.addParam('sysparm_current_sys_id', g_form.getUniqueValue());
        ga.getXMLAnswer(getResult);
        return false;
    }
    return true;
}

function getResult(response) {
    if (response !== "true") {
        save();
        return;
    }

    var dialog = new GlideModal('glide_modal_confirm', true, 400);
    dialog.setTitle(new GwtMessage().getMessage('Existing favorite configurations'));
    dialog.setPreference('body', new GwtMessage().getMessage("There are multiple active records for this content type. Are you sure you want to continue?"));
    dialog.setPreference('focusTrap', true);
    dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('Yes'));
    dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('No'));
    dialog.setPreference('onPromptComplete', save.bind(this));
    dialog.setPreference('onPromptCancel', function() {});
    dialog.render();
}

function save() {
    gFormAlreadySubmitted = true;
    g_form.submit(g_form.getActionName());
}
