function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var message = getMessage('Note: You will lose any content targeted to this Topic/Sub-Topic when you change template. The content would need to be scheduled to the Topic again.');
    if (!g_form.isNewRecord()) {
        g_form.clearValue('apply_to_child_topics');
        g_form.clearMessages();
        g_form.addInfoMessage(message);
    }
}
