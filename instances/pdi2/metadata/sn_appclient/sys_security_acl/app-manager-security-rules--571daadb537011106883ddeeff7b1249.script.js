var isAdminOrAppClientUser = gs.hasRole("admin") || gs.hasRole("sn_appclient.app_client_user");
var isReadOnlyPluginUser = gs.hasRole("unified_plugin_read_only") && !gs.hasRole("admin") && !gs.hasRole("maint");
var isReadOnlyAppUser = gs.hasRole("unified_plugin_read_only") && !gs.hasRole('sn_appclient.app_client_company_installer') && !gs.hasRole("sn_appclient.app_client_user") && !gs.hasRole("admin") && !gs.hasRole("maint");
var isCompanyInstallerUser = gs.hasRole('sn_appclient.app_client_company_installer') && !gs.hasRole("sn_appclient.app_client_user") && !gs.hasRole("admin") && !gs.hasRole("maint");
answer = (isAdminOrAppClientUser || isReadOnlyPluginUser || isReadOnlyAppUser || isCompanyInstallerUser);
