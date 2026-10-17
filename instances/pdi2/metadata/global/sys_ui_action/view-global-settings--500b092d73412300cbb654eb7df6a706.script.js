
function viewGlobalSettings() {
    var url = 'system_properties_ui.do?sysparm_title=On-Call Properties&sysparm_category=On-Call Debug,On-Call Calendar Color,On-Call Rota Management,On-Call Reminder';
    var globalSettingWindow = window.open(url, '_blank');
    globalSettingWindow.focus();
}
