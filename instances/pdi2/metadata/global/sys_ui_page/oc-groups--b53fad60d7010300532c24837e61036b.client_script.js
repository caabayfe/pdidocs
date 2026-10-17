window.NOW = window.NOW || {};
window.NOW.isPolarisEnabled = "${sn_ui.PolarisUI.isEnabled()}";
window.NOW.on_call_groups = window.NOW.on_call_groups || {};
window.NOW.on_call_groups.pinned_groups = '$[JS:jvar_user.getPreference("com.snc.on_call_rotation.landing_page.pinned_groups")]';
window.NOW.on_call_groups.group_filter = '$[JS:jvar_user.getPreference("com.snc.on_call_rotation.landing_page.group_filter")]';
window.NOW.on_call_groups.group_limit = '$[JS:gs.getProperty("com.snc.on_call_rotation.landing_page.group_limit", "20")]';
window.NOW.on_call_groups.max_groups = '$[JS:gs.getProperty("com.snc.on_call_rotation.landing_page.max_groups", "300")]';
window.NOW.on_call_groups.pinned_notification = '$[JS:gs.getProperty("com.snc.on_call_rotation.landing_page.pinned_notification", "false")]';
window.NOW.on_call_groups.notification_timeout = '$[JS:gs.getProperty("com.snc.on_call_rotation.landing_page.notification_timeout", "4000")]';
window.NOW.on_call_groups.show_wizard_btn = '$[JS:gs.getProperty("com.snc.on_call_rotation.landing_page.show_wizard_btn", "false")]';
window.NOW.on_call_groups.debounce_wait = '$[JS:gs.getProperty("com.snc.on_call_rotation.landing_page.debounce_wait", "500")]';
window.NOW.on_call_groups.chat_enabled = '$[jvar_connect_installed_and_enabled]';
window.NOW.is_Slack_Spoke_Installed = '$[JS:jvar_use_slack_dm]';
window.NOW.is_MS_Teams_Installed = '$[JS:jvar_use_msteams_dm]';
window.NOW.on_call_groups.isAccessibilityEnabled = '$[JS:GlideAccessibility.isEnabled()]';
window.NOW.user_id = "$[jvar_user.getID()]";
window.g_ck = "$[gs.getSessionToken()]";
window.NOW.user_time_format = "$[gs.getTimeFormat()]";
window.NOW.USER_PREF = window.NOW.USER_PREF || {};
window.NOW.USER_PREF.IS_DARK_THEME_ENABLED = "$[jvar_is_dark_theme_enabled]" == "true";

if (!window.g_user) {
	window.g_user = new GlideUser('$[JS:jvar_user.getName()]',
		'$[JS:jvar_user.getFirstName()]',
		'$[JS:jvar_user.getLastName()]',
		'$[JS:jvar_roles]',
		'$[jvar_user.getID()]',
		'$[JS:jvar_user.getDepartmentID()]');
}
