function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var topicName = g_form.getDisplayBox('topic').value;
    if (topicName) {
        var buttonText = new GwtMessage().getMessage('Browse {0}', topicName);
        g_form.setValue('browse_button_text', buttonText);
    }
}
