function revokeAccess() {
    g_form.setValue('decision', 'revoke');
    if (!g_form.getValue('justification')) {
        g_form.showFieldMsg('justification', getMessage('Explain why this access is revoked.'), 'error');
        return false;
    }
    gsftSubmit(null, g_form.getFormElement(), 'access_review_revoke');
}

if (typeof window == 'undefined') {
    current.setValue('decision', 'revoke');
    current.update();
    action.setRedirectURL(current);
}
