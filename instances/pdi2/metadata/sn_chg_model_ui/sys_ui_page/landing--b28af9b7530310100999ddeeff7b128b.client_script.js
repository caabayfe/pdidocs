window.NOW = window.NOW || {};
window.NOW.chg_model_landing = window.NOW.chg_model_landing || {};
window.NOW.chg_model_landing.pinned_change_models = '$[JS:jvar_user.getPreference("sn_chg_model_ui.landing_page.pinned_change_models")]';
window.NOW.chg_model_landing.chg_model_filter = '$[JS:jvar_user.getPreference("sn_chg_model_ui.landing_page.chg_model_filter")]';
window.NOW.chg_model_landing.chg_model_limit = '$[JS:gs.getProperty("sn_chg_model_ui.landing_page.chg_model_limit", "40")]';
window.NOW.chg_model_landing.max_chg_models = '$[JS:gs.getProperty("sn_chg_model_ui.landing_page.max_chg_models", "300")]';
window.NOW.chg_model_landing.pinned_notification = '$[JS:gs.getProperty("sn_chg_model_ui.landing_page.pinned_notification", true)]';
window.NOW.chg_model_landing.notification_timeout = '$[JS:gs.getProperty("sn_chg_model_ui.landing_page.notification_timeout", "4000")]';
window.NOW.chg_model_landing.canCreate = '$[JS:GlideTableDescriptor.get("change_request").canCreate()]';
window.NOW.chg_model_landing.isStdChgCatalogActive = '$[JS:global.ChangeCommon.isPluginActive("com.snc.change_management.standard_change_catalog")]';
window.NOW.chg_model_landing.enableLegacyPreapprovedTitle = '$[JS:gs.getProperty("sn_chg_model_ui.landing_page.enable_legacy_preapproved_title", "false")]';

window.NOW.chg_model_landing.url_params = {
	"sys_target": "$[JS:RP.getParameterValue('sys_target')]",
	"sysparm_collection": "$[JS:RP.getParameterValue('sysparm_collection')]",
	"sysparm_collectionID": "$[JS:RP.getParameterValue('sysparm_collectionID')]",
	"sysparm_collection_key": "$[JS:RP.getParameterValue('sysparm_collection_key')]",
	"sysparm_collection_label": "$[JS:RP.getParameterValue('sysparm_collection_label')]",
	"sysparm_collection_related_field": "$[JS:RP.getParameterValue('sysparm_collection_related_field')]",
	"sysparm_collection_related_file": "$[JS:RP.getParameterValue('sysparm_collection_related_file')]",
	"sysparm_collection_relationship": "$[JS:RP.getParameterValue('sysparm_collection_relationship')]",
	"sysparm_referring_url": "$[JS:RP.getParameterValue('sysparm_referring_url')]",
	"sysparm_stack" : "$[JS:RP.getParameterValue('sysparm_stack')]",
	"sysparm_target": "$[JS:RP.getParameterValue('sysparm_target')]",
	"sysparm_view": "$[JS:RP.getParameterValue('sysparm_view')]",
	"sysparm_nameofstack": "$[JS:RP.getParameterValue('sysparm_nameofstack')]"
};

window.NOW.user_id = "$[jvar_user.getID()]";
window.NOW.macro_flush_stamp = '$[JS:global.ChangeCommon.cacheInvalidation.getUIMacroFlushStamp()]';
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
