function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_scratchpad.canRouteToEMS == 'true') {
        g_form.hideRelatedList('sys_user_has_license.user');
        g_form.hideRelatedList('ua_user_role_ct.user');
    }
}
