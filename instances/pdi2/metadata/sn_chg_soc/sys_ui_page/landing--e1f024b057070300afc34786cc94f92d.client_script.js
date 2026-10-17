window.NOW = window.NOW || {};
window.NOW.soc_schedules = window.NOW.soc_schedules || {};
window.NOW.soc_schedules.pinned_schedules = '$[JS:jvar_user.getPreference("com.snc.soc.landing_page.pinned_schedules")]';
window.NOW.soc_schedules.schedule_filter = '$[JS:jvar_user.getPreference("com.snc.soc.landing_page.schedule_filter")]';
window.NOW.soc_schedules.schedule_limit = '$[JS:gs.getProperty("sn_chg_soc.landing_page.schedule_limit", "40")]';
window.NOW.soc_schedules.max_schedules = '$[JS:gs.getProperty("sn_chg_soc.landing_page.max_schedules", "300")]';
window.NOW.soc_schedules.pinned_notification = '$[JS:gs.getProperty("com.snc.soc.landing_page.pinned_notification", true)]';
window.NOW.soc_schedules.notification_timeout = '$[JS:gs.getProperty("sn_chg_soc.landing_page.notification_timeout", "4000")]';
window.NOW.soc_schedules.chat_enabled = '$[jvar_connect_installed_and_enabled]';
window.NOW.soc_schedules.canCreate = '$[JS:GlideTableDescriptor.get("chg_soc_definition").canCreate()]';
window.NOW.user_id = "$[jvar_user.getID()]";
window.g_ck = "$[gs.getSessionToken()]";

if (!window.g_user) {
	window.g_user = new GlideUser('$[JS:jvar_user.getName()]',
		'$[JS:jvar_user.getFirstName()]',
		'$[JS:jvar_user.getLastName()]',
		'$[JS:jvar_roles]',
		'$[jvar_user.getID()]',
		'$[JS:jvar_user.getDepartmentID()]');
}

if (window.GlideWebAnalytics)
	window.GlideWebAnalytics.trackPage();
