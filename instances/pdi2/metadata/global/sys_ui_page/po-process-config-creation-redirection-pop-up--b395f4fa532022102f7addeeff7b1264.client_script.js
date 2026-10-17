function redirectToNewProcessDef() {
    setUserPreference(true);
    var url = new GlideURL('promin_process_def.do');
    url.addParam('sys_id', "-1");
    g_navigation.open(url.getURL(), "_blank");
}

function redirectToProcessConfigBuilder() {
    setUserPreference(false);
    g_navigation.open("now/experience/promin/process-configuration", "_blank");
}

function setUserPreference(isPlatform) {
    var dontShowMe = document.getElementById("dont_show_me_checkbox").checked;
    if (dontShowMe) {
        setPreference("promin.process_config_hide_popup_notification", true);
        setPreference("promin.is_process_config_platform_setup", isPlatform);
    }
}
