function onLoad() {
    var gwt = new GwtMessage();
    if (!g_form.getBooleanValue('active'))
        g_form.showFieldMsg('active', gwt.getMessage('Rule is inactive. It is recommended to recalculate archive estimate before setting rule to active.'));

    if (!g_form.getBooleanValue('destroy_rule.active'))
        g_form.showFieldMsg('destroy_rule.active', gwt.getMessage('Rule is inactive. It is recommended to recalculate destroy estimate before setting rule to active.'));

}
