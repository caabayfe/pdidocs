function onLoad() {
    // Hide inactive field for MESP portal
    if (g_form.getUniqueValue() == '26f2fffb77322300454792718a1061e5') {
        g_form.setDisplay('inactive', false);
        return;
    }
    if (g_form.getValue('inactive') == "true" && g_form.getValue('alternate_portal') == "") {
        g_form.addInfoMessage(getMessage("Portal deactivated. Users can no longer access this portal"));
        return;
    }
    if (g_form.getValue('inactive') == "true" && g_form.getValue('alternate_portal') != "") {
        var ga = new GlideAjax('global.ValidateAlternatePortal');
        ga.addParam('sysparm_name', 'getPortalTitleFromId');
        ga.addParam('portalId', g_form.getValue('alternate_portal'));
        ga.getXMLWait();
        var response = ga.getAnswer();
        if (response != "")
          g_form.addInfoMessage(formatMessage(getMessage("Users accessing this portal will be redirected to {0}."), response));
        return;
    }

}
