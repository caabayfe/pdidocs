function onSubmit() {
    if (g_scratchpad.isVirtualAlertFeatureActive) {
        if (g_form.getBooleanValue("override_group_description")) {
            if (g_form.getValue("custom_group_description").trim() == "") {
                var emptyMsg = new GwtMessage().getMessage("'Custom description' must have a value");
                g_form.showErrorBox('custom_group_description', emptyMsg, true);

                // Prevent submission
                return false;
            }

            if (g_form.getValue("custom_group_description").trim() == "Group of alerts") {
                var defaultMsg = new GwtMessage().getMessage("'Custom description' must be different from its default value");
                g_form.showErrorBox('custom_group_description', defaultMsg, true);

                // Prevent submission
                return false;
            }
        }

        // Allow submission
        return true;
    }
}
