window.NOW = window.NOW || {};
window.NOW.user = {};
window.NOW.user.preferences = [];
window.NOW.user.roles = '$[JS:GlideStringUtil.join(GlideSecurityManager.get().getRoles())]';
window.NOW.user.allRoles = '$[JS:GlideStringUtil.join(GlideSecurityManager.get().getRoles(true))]';
window.NOW.user.userID = '$[jvar_user.getID()]';
window.NOW.user.departmentID = '$[JS:jvar_user.getDepartmentID()]';
window.NOW.user.firstName = '$[NG,JS:jvar_user.getFirstName()]';
window.NOW.user.lastName = '$[NG,JS:jvar_user.getLastName()]';
window.NOW.user.name = '$[NG,JS:jvar_user.getName()]';
window.NOW.sn_chg_soc = {};
window.NOW.sn_chg_soc.redirect ='$[JS:jvar_redirect]';
window.NOW.sn_chg_soc.limit = parseInt('$[NG,JS:gs.getProperty("sn_chg_soc.change_soc_total_limit", 1000)]', 10);
window.NOW.sn_chg_soc.limit = window.NOW.sn_chg_soc.limit > 2500 ? 2500 : window.NOW.sn_chg_soc.limit;
window.g_ck = "$[gs.getSessionToken()]";
if (window.GlideWebAnalytics)
	window.GlideWebAnalytics.trackPage();
