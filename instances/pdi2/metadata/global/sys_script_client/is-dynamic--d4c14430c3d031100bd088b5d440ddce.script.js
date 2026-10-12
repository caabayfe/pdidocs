function onLoad(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (g_form.getValue("type") != "compound")
        g_form.showFieldMsg('is_dynamic',  getMessage('When this field is checked it is evaluated per transaction. When this field is unchecked it is evaluated per session.'), 'info');
}
