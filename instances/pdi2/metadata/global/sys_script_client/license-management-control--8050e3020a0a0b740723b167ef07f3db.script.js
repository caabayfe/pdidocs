function onLoad() {
    var manual = g_form.getValue("manual");
    var disco  = g_form.getValue("discoverable_key");
  

    if (manual == "true") {
        g_form.showRelatedList("ast_license_software_instance");
        g_form.hideRelatedList("ast_license_package_instance");
    } else {
        if (disco == "true") {
            g_form.showRelatedList("ast_license_software_instance");
            g_form.showRelatedList("ast_license_package_instance");
        } else {
            g_form.hideRelatedList("ast_license_software_instance");
            g_form.showRelatedList("ast_license_package_instance");
        }        
    }
}
