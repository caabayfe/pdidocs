function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	
	var idTokenDatasource = "import_data_source";
	var userInfoDatasource = "user_info_data_source";

    // Get the provision source field
    var provSource = g_form.getValue("provision_source");
    // If Update User on login is enabled, then set corresponding data source based
	// on Provision Source and user role are mandatory
    if (newValue === "true") {
		// Make update_time_interval as editable, if Update User on login is enabled
        g_form.setDisabled("update_time_interval", false);
		
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
		// Make update_time_interval as non-editable.
        g_form.setDisabled("update_time_interval", true);
		
		// Make fields non mandatory only if Update user on next login field also is false.
        if (g_form.getValue("automatically_import_users") === "false") {
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
