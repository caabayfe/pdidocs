function redirectToNewProjectDef() {
	setUserPreference(true);
    var url = new GlideURL('promin_project.do');
    url.addParam('sys_id', "-1");
    g_navigation.open(url.getURL(), "_blank");
}

function redirectToProjectBuilder() {
	setUserPreference(false);
    g_navigation.open("now/experience/promin/promin_project/-1/set-objectives", "_blank");
}

function setUserPreference(isPlatform) {
	var dontShowMe = document.getElementById("dont_show_me_checkbox").checked;
	if(dontShowMe) {
		setPreference("promin.project_hide_popup_notification", true);
		setPreference("promin.is_project_platform_setup", isPlatform);
	}
}
