function onLoad() {
    if (g_scratchpad.ais_profile_id && g_scratchpad.ais_profile_name) {
        g_form.addInfoMessage('This dictionary will be automatically linked to the profile: "' + g_scratchpad.ais_profile_name + '". If you do not want it to be auto-linked, click the "Save Without Linking" button instead of "Submit"');
    }
}
