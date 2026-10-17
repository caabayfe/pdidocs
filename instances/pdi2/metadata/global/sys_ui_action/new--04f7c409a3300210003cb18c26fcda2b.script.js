function showRedirectionWindowForProjectSetup() {
	var hide_popup = getPreference("promin.project_hide_popup_notification");
	if(hide_popup == 'true') {
		if(getPreference("promin.is_project_platform_setup") == 'true'){
			redirectToPlatform();
		}else{
			redirectToProjectBuilder();
		}
	}else{
		var dialog = new GlideModal("po_project_creation_redirection_pop_up", false);
		var title = getMessage('Use project builder for best experience');
		dialog.setTitle(title);
		dialog.setPreference('focusTrap', true);
		dialog.render();
	}
}

function redirectToPlatform() {
    var url = new GlideURL('promin_project.do');
    url.addParam('sys_id', "-1");
    g_navigation.open(url.getURL(), "_blank");
}

function redirectToProjectBuilder() {
    g_navigation.open("now/experience/promin/promin_project/-1/set-objectives", "_blank");
}
