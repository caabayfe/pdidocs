function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
    
    if (g_form.getValue('create_access_controls') == 'true') {
        confirmChangeRole(oldValue, newValue);
        return;
    }
    
    if (g_form.getValue('user_role') != '') {
        // Real value is set, so leave it alone.
        return;
    }
    
    // Since only the display value could be set here, be sure it is empty so we do not
    // create a user role
    g_form.clearValue('user_role');
}

function confirmChangeRole(originalRole, currentRole) {
    if (originalRole == '' || originalRole == currentRole)
        return;
    
    showChangeRoleDialog(function() {
		// Cancelling the role change, so swap the original back in and report it.
        g_form.setValue('user_role', originalRole);
        g_form.showFieldMsg('user_role', getMessage('Changed back to original value'), 'info');
        g_form.flash('user_role', '#FFFACD', 0);
    });
}

function showChangeRoleDialog(cancelCallback) {
    var dialog = new GlideDialogWindow('glide_confirm_standard');
    dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
    dialog.setPreference('warning', true);
    dialog.setPreference('title', getMessage('Changing the user role will swap the original role for the new role on all of your existing access controls listed below. Keep the new value?'));
    dialog.setPreference('defaultButton', 'ok_button');
	dialog.setPreference('onPromptCancel', cancelCallback.bind(this));
    dialog.render();	
}
