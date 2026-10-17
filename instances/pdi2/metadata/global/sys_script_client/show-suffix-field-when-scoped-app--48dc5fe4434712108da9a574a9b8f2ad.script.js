function onLoad() {

    var recordScope = g_form.getReference('sys_scope');
    var scope = recordScope ? recordScope.scope : g_scratchpad.scope;

    if (scope == 'global') {
        g_form.setDisplay('suffix', false);
        return;
    }
    if (g_form.isNewRecord()) {
        g_form.setValue('queue', scope + '.' + g_form.getValue('suffix'));
        g_form.setMandatory('suffix', true);
    } else {
        g_form.setReadOnly('suffix', true);
    }
    g_form.setReadOnly('queue', true);

}
