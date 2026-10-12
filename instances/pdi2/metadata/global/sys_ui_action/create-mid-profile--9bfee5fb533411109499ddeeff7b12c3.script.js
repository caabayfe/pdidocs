function createMidProfile() {
    var midID = g_form.getUniqueValue();
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dialog = new dialogClass('mid_profile_confirm');

    // If MID server belongs to a profile then prompt user either to create a new profile or to navigate to the existing profile
    var profileID = typeof g_form != 'undefined' ? g_form.getValue("profile_id") : _getProfileIDFromAgentID(midID);
    if (profileID) {
        dialog.setTitle('Existing MID Profile Record Found');
        dialog.setWidth(450);
        dialog.setPreference("profile_id", profileID);
        dialog.setPreference("mid_record", midID);
        dialog.setPreference("profile_found", 'true');
        dialog.render();
    } else {
        dialog.setTitle('Confirmation');
        dialog.setWidth(450);
        dialog.setPreference("profile_id", '');
        dialog.setPreference("mid_record", midID);
        dialog.setPreference("profile_found", 'false');
        dialog.render();
    }
}

function _getProfileIDFromAgentID(agentID) {
    var gr = new GlideRecord("ecc_agent");
    gr.get(agentID);
    return gr.getValue("profile_id");
}
