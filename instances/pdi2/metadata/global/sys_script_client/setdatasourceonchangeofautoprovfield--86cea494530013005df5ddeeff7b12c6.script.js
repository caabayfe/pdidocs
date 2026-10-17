function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

	var idTokenDatasource = "import_data_source";
	var userInfoDatasource = "user_info_data_source";

    // Get the provision source field
    var provSource = g_form.getValue("provision_source");
    // if Auto Provisioning is active, then set Corresponding data source based
	// on Provision Source and roles_for_imported_users fields as mandatory
    if (newValue === "true") {
		// Make roles_for_imported_users as mandatory if Automatic Provisioning is true
		// As role assignment is required for auto provisioning.
        g_form.setMandatory("roles_for_imported_users", true);
		
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
		// Make roles_for_imported_users as non mandatory if Automatic Provisioning is false
		// As role assignment is only required during auto provisioning.
        g_form.setMandatory("roles_for_imported_users", false);
		
		// Make fields non mandatory if Update user on next login is false.
        if (g_form.getValue("update_user_on_login") === "false") {
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
    }
}
