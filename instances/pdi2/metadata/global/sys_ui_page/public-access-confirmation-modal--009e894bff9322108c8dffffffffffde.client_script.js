addLoadEvent(function() {
    var gdw = GlideDialogWindow.get();
    var message = gdw.getPreference('sysparm_message');
    if (message) {
        gel('confirm-message').innerHTML = message;
    }
});

function confirmChange() {
    g_scratchpad.publicAccessConfirmed = true;
    g_form.save();
    GlideDialogWindow.get().destroy();
}

function cancelChange() {
    var gdw = GlideDialogWindow.get();
    var oldValue = gdw.getPreference('sysparm_old_value');

    g_form.setValue('public_access', oldValue);
    gdw.destroy();
}
