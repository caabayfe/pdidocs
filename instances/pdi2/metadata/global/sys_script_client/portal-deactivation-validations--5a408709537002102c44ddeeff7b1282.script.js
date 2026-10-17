function onSubmit() {
    if (g_form.getValue('inactive') == "true") {
        var defaultPortal = g_form.getValue('default');
        if (defaultPortal == "") {
            var portalId = g_form.getUniqueValue();
            var ga = new GlideAjax('global.ValidateAlternatePortal');
            ga.addParam('sysparm_name', 'isPortalDefault');
            ga.addParam('portalId', portalId);
            ga.getXMLWait();
            defaultPortal = ga.getAnswer();
        }
        if (defaultPortal == "true") {
            g_form.addErrorMessage(getMessage('The default portal cannot be deactivated.'));
            return false;
        }
    }

    if (g_form.getValue('inactive') == "true") {
        portalId = g_form.getUniqueValue();
        ga = new GlideAjax('global.ValidateAlternatePortal');
        ga.addParam('sysparm_name', 'getReferencedAlternatePortals');
        ga.addParam('portalId', portalId);
        ga.getXMLWait();
        var response = ga.getAnswer();
        if (response != "") {
            g_form.addErrorMessage(formatMessage(getMessage('This portal cannot be deactivated since it is configured as an alternate portal for {0}.'), response));
            return false;
        }
    }

    if (g_form.getValue('inactive') == "true" && g_form.getValue("alternate_portal")) {
        portalId = g_form.getValue("alternate_portal");
        ga = new GlideAjax('global.ValidateAlternatePortal');
        ga.addParam('sysparm_name', 'isPortalInActive');
        ga.addParam('portalId', portalId);
        ga.getXMLWait();
        response = ga.getAnswer();
        if (response == "true") {
            g_form.addErrorMessage(getMessage('The portal selected as alternate portal is currently inactive. Please select an active portal'));
            return false;
        }
    }
}
