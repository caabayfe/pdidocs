function showRedirectionWindowForProcessConfig() {
    var hide_popup = getPreference("promin.process_config_hide_popup_notification");
    if (hide_popup == 'true') {
        if (getPreference("promin.is_process_config_platform_setup") == 'true') {
            redirectToPlatform();
        } else {
            redirectToProcessConfigBuilder();
        }
    } else {
        var dialog = new GlideModal("po_process_config_creation_redirection_pop_up", false);
        var title = getMessage('Use process configuration builder for best experience');
        dialog.setTitle(title);
        dialog.setPreference('focusTrap', true);
        dialog.render();
    }
}

function redirectToPlatform() {
    var url = new GlideURL('promin_process_def.do');
    url.addParam('sys_id', "-1");
    g_navigation.open(url.getURL(), "_blank");
}

function redirectToProcessConfigBuilder() {
    g_navigation.open("now/experience/promin/process-configuration", "_blank");
}
