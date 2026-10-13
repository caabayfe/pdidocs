var flag = false; // To avoid calling onChange as we are setting owner back to the oldValue else pop up will come infinitely.

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    // Avoid taking confirmation while loading, newValue is empty, no change to the owner field and for reconfirmation when hit cancel.
    if (isLoading || newValue === '' || flag || oldValue === newValue) {
        flag = false; // To allow pop up once the user has decided with selection.
        return;
    }

    // Confirmation pop up
    showConfirmationDialog(oldValue);
}

function showConfirmationDialog(oldValue) {
    var dialog = new GlideModal('glide_modal_confirm', true, 400);
    dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
    dialog.setPreference('body', new GwtMessage().getMessage('Changing the folder owner will update its domain to the domain of new owner. This may affect your access. Do you want to continue?'));
    dialog.setPreference('focusTrap', true);
    dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('Continue'));
    dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('Cancel'));
    dialog.setPreference('onPromptCancel', function() {
        flag = true;
        g_form.setValue('owner', oldValue);
        return;
    });
    dialog.render();
}
