function onCondition() {
    g_form.setSectionDisplay('appletoken_basedauthentication', false);
    g_form.setSectionDisplay('applecertificate_basedauthentication', true);
    var tabIndex = g_tabs2Sections.findTabIndexByName('applecertificate_basedauthentication');
    g_tabs2Sections.setActive(tabIndex);
}
