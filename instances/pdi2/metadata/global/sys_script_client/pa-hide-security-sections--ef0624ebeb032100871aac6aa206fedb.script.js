function onLoad() {
    if (!g_user.hasRole('admin') && !g_user.hasRole('pa_admin') && !g_user.hasRole('pa_power_user')) {
        g_form.setSectionDisplay('security', false);   
        g_form.hideRelatedList('pa_dimensions_acl');
    }
}
