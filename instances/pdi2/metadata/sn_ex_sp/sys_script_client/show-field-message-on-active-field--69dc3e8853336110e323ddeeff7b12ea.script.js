function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var portalName = g_form.getDisplayBox('portal').value;
    var infoMessage = new GwtMessage().getMessage('Activating replaces the current {0} navigation menu with the one created and managed here.', portalName);
    g_form.hideFieldMsg('active');
    g_form.showFieldMsg("active", infoMessage);
}
