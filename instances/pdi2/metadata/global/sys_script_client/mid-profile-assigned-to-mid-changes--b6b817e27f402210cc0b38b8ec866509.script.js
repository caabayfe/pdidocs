function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var midStatus = g_form.getValue('status');
    var profileId = newValue;
    var gwt = new GwtMessage();

    if (newValue != oldValue && midStatus != "Down" && profileId != "") {
        // get profile number and name
        var gr = new GlideRecord('mid_server_profile');
        gr.get(newValue);
        var profileNumber = gr.getValue('number');
        var profileName = gr.getValue('name');

        var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
        var gdw = new dialogClass("sync_profile_to_mids");
        gdw.setTitle(gwt.getMessage("Do you want to sync MID Profile: '{0}' settings to this MID Server?", profileName));
        gdw.setWidth("100%");
        gdw.setPreference("profileIds", profileId);
        gdw.setPreference("profileNumbers", profileNumber);
        gdw.setPreference("profileName", profileName);
        gdw.setPreference("fromUIAction", false);
        gdw.render();
    }
}
