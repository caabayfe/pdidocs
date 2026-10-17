function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    if (!$('kba-guidance-auth') || !$('kba-guidance-auth-header') || !$('kba-guidance-ident') || !$('kba-guidance-ident-header')) {
        return;
    }
 
    if (newValue === 'authentication') {
        g_form.clearMessages();
        g_form.addWarningMessage(new GwtMessage().getMessage('This script will be used to authenticate users. Please ensure it correctly validates user answers to maintain authentication integrity.'));
        $('kba-guidance-ident').up().hide();
        $('kba-guidance-ident-header').up().hide();
        $('kba-guidance-auth').up().show();
        $('kba-guidance-auth-header').up().show();
    } else if (newValue === 'identification') {
        g_form.clearMessages();
        g_form.addWarningMessage(new GwtMessage().getMessage('This script will be used to identify users. Please ensure it correctly resolves user answers to the right record.'));
        $('kba-guidance-auth').up().hide();
        $('kba-guidance-auth-header').up().hide();
        $('kba-guidance-ident').up().show();
        $('kba-guidance-ident-header').up().show();
    } else {
        g_form.clearMessages();
        $('kba-guidance-auth').up().hide();
        $('kba-guidance-ident').up().hide();
        $('kba-guidance-auth-header').up().hide();
        $('kba-guidance-ident-header').up().hide();
    }


}
