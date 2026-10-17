function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

	var isMandatory = false;
	var idTokenDatasource = "import_data_source";
	var userInfoDatasource = "user_info_data_source";

	// If either of automatically_import_users or update_user_on_login is true then
	// set datasources as mandatory based on the Povision Source
    if (g_form.getValue("automatically_import_users") === "true" || g_form.getValue("update_user_on_login") === "true") {
		isMandatory = true;
    }

    // Set the appropriate datasource based on Provision source value
	var provSource = newValue;
    if (provSource == "id_token") {
        // Make id_token data source as mandatory and visible, User Info as invisible
        g_form.setMandatory(idTokenDatasource, isMandatory);
		g_form.setDisplay(idTokenDatasource, true);
        
		g_form.setMandatory(userInfoDatasource, false);
        g_form.setDisplay(userInfoDatasource, false);
    } else if (provSource == "user_info") {
        // Make User Info data source as mandatory and visible, id_token as invisible
        g_form.setMandatory(userInfoDatasource, isMandatory);
		g_form.setDisplay(userInfoDatasource, true);
        
		g_form.setMandatory(idTokenDatasource, false);
        g_form.setDisplay(idTokenDatasource, false);
    } else if (provSource == "both") {
        // Make both  id_token and User Info data source as mandatory and visible
        g_form.setMandatory(userInfoDatasource, isMandatory);
		g_form.setDisplay(userInfoDatasource, true);
        
		g_form.setMandatory(idTokenDatasource, isMandatory);
        g_form.setDisplay(idTokenDatasource, true);
    }
}
