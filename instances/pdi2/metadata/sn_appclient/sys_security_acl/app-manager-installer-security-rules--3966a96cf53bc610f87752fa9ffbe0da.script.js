var isAdminOrAppClientUser = gs.hasRole("admin") || gs.hasRole("sn_appclient.app_client_user");
    var isCompanyInstallerUser = gs.hasRole('sn_appclient.app_client_company_installer') && !gs.hasRole("sn_appclient.app_client_user") && !gs.hasRole("admin") && !gs.hasRole("maint");
answer = (isAdminOrAppClientUser || isCompanyInstallerUser);
