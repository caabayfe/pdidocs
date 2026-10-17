function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var menuName = g_form.getDisplayBox('menu').value;
    if (menuName) {
        var buttonText = new GwtMessage().getMessage('Browse {0}', menuName);
        g_form.setValue('browse_button_text', buttonText);
    }
}
