function onLoad() {
    var gwt = new GwtMessage();
    if (!g_form.getBooleanValue('retain_references'))
        g_form.showFieldMsg('destroy_rule.condition', gwt.getMessage('Conditions are only available when retain reference is checked.'));
    if (g_scratchpad.showOffloadMessage)
        g_form.showFieldMsg('destroy_rule.archive_duration', gwt.getMessage('Offloaded records are always destroyed using archive duration.'));
    if (!g_scratchpad.shouldDisplayConditions) {
        g_form.setDisplay('destroy_rule.condition', false);
        var annotation = document.getElementById('destroyConditionsMsg');
        if (annotation && annotation.parentElement)
            annotation.parentElement.style.display = 'none';
    }
}
