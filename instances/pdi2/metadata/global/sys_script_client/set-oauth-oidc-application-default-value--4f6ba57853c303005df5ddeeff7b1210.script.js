function onLoad() {
    if (g_form.getViewName() == 'oauth_oidc_provider') {
        g_form.setReadOnly("client_id", false);
        g_form.setMandatory("client_id", true);
        g_form.setMandatory("client_secret", true);
        var scopeRestrictionStatus = g_form.getValue('scope_restriction_status');
        if (scopeRestrictionStatus == 'useraccount')
            g_form.setReadOnly('scope_restriction_status', true);
        else {

            g_form.removeOption('scope_restriction_status', 'useraccount');
        }

        if (g_form.isNewRecord()) {
            g_form.setValue("type", "oauth_provider");
            g_form.setValue("client_id", "");
            g_form.setValue('scope_restriction_status', 'restricted');
        }

		
        // Set Auto Provisioning fields
		
		// Get the provision source
		var provSource = g_form.getValue("provision_source");
		
		var idTokenDatasource = "import_data_source";
		var userInfoDatasource = "user_info_data_source";
		
		// if either of automatically_import_users or update_user_on_login is enabled then
		// set the datasources mandatory based on provision source
        if (g_form.getValue("automatically_import_users") === "true" || g_form.getValue("update_user_on_login") === "true") {
            if (provSource == "id_token") {
                // Make id_token data source as mandatory and visible, User Info as invisible
                g_form.setDisplay(idTokenDatasource, true);
                g_form.setMandatory(idTokenDatasource, true);

                g_form.setDisplay(userInfoDatasource, false);
                g_form.setMandatory(userInfoDatasource, false);

            } else if (provSource == "user_info") {
                // Make User Info data source as mandatory and visible, id_token as invisible
                g_form.setDisplay(userInfoDatasource, true);
                g_form.setMandatory(userInfoDatasource, true);

                g_form.setDisplay(idTokenDatasource, false);
                g_form.setMandatory(idTokenDatasource, false);
            } else if (provSource == "both") {
                // Make both  id_token and User Info data source as mandatory and visible
                g_form.setDisplay(userInfoDatasource, true);
                g_form.setMandatory(userInfoDatasource, true);

                g_form.setDisplay(idTokenDatasource, true);
                g_form.setMandatory(idTokenDatasource, true);
            }
        } else {
            if (provSource == "id_token") {
                // Make id_token data source visible but non mandatory, User Info as invisible
                g_form.setDisplay(idTokenDatasource, true);
                g_form.setMandatory(idTokenDatasource, false);

                g_form.setDisplay(userInfoDatasource, false);
                g_form.setMandatory(userInfoDatasource, false);

            } else if (provSource == "user_info") {
                // Make User Info data source visible but non mandatory, id_token as invisible
                g_form.setDisplay(userInfoDatasource, true);
                g_form.setMandatory(userInfoDatasource, false);

                g_form.setDisplay(idTokenDatasource, false);
                g_form.setMandatory(idTokenDatasource, false);
            } else if (provSource == "both") {
                // Make both id_token and User Info data source visible and non mandatory
                g_form.setVisible(userInfoDatasource, true);
                g_form.setMandatory(userInfoDatasource, false);

                g_form.setVisible(idTokenDatasource, true);
                g_form.setMandatory(idTokenDatasource, false);
            }
        }
		
		// Set mandatory for roles if Auto Provision is enabled.
		if (g_form.getValue("automatically_import_users") === "true") {
			g_form.setMandatory("roles_for_imported_users", true);
		} else  {
			g_form.setMandatory("roles_for_imported_users", false);
		}
		
		// Set update_time_interval to editable if update user on login is true
		if (g_form.getValue("update_user_on_login") === "true") {
			g_form.setDisabled("update_time_interval", false);
		} else  {
			g_form.setDisabled("update_time_interval", true);
		}
		
		if(g_form.getValue("update_time_interval") === ''){
			g_form.setValue('update_time_interval', 3600);
		}

    }
    g_form.setDisplay("type", false);
    g_form.setReadOnly("type", true);
}
