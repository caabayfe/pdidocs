function onLoad() {
    if (!g_form.getBooleanValue('active')) {
        var gwt = new GwtMessage();
        g_form.showFieldMsg('active', gwt.getMessage('Rule is inactive. It is recommended to recalculate destroy estimate before setting rule to active.'));
    }
}
