function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    //Populate queue with scope + suffix
    var recordScope = g_form.getReference('sys_scope');
    var scope = recordScope ? recordScope.scope : g_scratchpad.scope;
    scope = scope == 'global' ? '' : scope + '.';

    g_form.setValue('queue', scope + newValue);
}
