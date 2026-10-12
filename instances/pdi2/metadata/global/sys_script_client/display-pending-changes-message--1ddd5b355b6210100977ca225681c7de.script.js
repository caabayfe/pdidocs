function onLoad() {

    var ga = new GlideAjax('AisConfigurationAjax');
    ga.addParam('sysparm_name', 'detectMissingStopWordDictionary');
    ga.addParam('sysparm_profile_sys_id', g_form.getUniqueValue());
    ga.getXML(function(response) {
            var isStopDictMissing = response.responseXML.documentElement.getAttribute("answer");
            if (isStopDictMissing === "true") {
                g_form.addInfoMessage(getMessage("Additional default stop word dictionaries available for this profile"));
            }
    });

    if (g_form.getValue('state') == 'DRAFT') {
        g_form.addInfoMessage(getMessage('Your search profile has pending changes. Publish the profile to apply the latest configurations.'));
    }
}
