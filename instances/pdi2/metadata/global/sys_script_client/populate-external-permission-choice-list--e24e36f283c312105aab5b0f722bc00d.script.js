function onLoad() {
	var selectedValue = g_form.getValue("external_permission");

    g_form.getReference("document_configuration", function(documentConfig) {
        if (documentConfig) {
            var providerSysId = documentConfig.provider;
            g_form.clearOptions("external_permission");

            var providerName = "";
            var providerDetailGr = new GlideRecord("mp_provider_detail");
            if (providerDetailGr.get(providerSysId)) {
                providerName = providerDetailGr.getValue("provider_name");
            }

            g_form.addOption("external_permission", "no_access", "No Access");

            switch (providerName.toLowerCase()) {
                case "googledrive":
                    g_form.addOption("external_permission", "g_reader", "Reader");
                    g_form.addOption("external_permission", "g_writer", "Writer");
                    g_form.addOption("external_permission", "g_commenter", "Commenter");
                    break;
                case "onedrive":
                    g_form.addOption("external_permission", "ms_reader", "Reader");
                    g_form.addOption("external_permission", "ms_writer", "Writer");
                    break;
            }

            if (selectedValue) {
                var isValid = g_form.getOption("external_permission", selectedValue) !== null; // Check if option exists
                if (isValid) {
                    g_form.setValue("external_permission", selectedValue);
                } else {
                    g_form.setValue("external_permission", "no_access"); // Default to 'no_access'
                }
            }
        } else {
            // Handle case where document_configuration reference is missing
            g_form.clearOptions("external_permission");
            g_form.addOption("external_permission", "no_access", "No Access");
        }
    });
}
