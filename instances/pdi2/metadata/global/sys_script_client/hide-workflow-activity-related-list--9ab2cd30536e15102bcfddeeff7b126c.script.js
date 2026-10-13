function onLoad() {
    if (g_user.hasRole('notify_admin')) {
        g_form.showRelatedList('notify_wf_activity');
    } else {
        g_form.hideRelatedList('notify_wf_activity');
    }
}
