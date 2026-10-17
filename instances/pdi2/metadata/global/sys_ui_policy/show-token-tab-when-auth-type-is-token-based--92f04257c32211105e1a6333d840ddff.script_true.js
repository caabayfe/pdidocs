function onCondition() {
    g_form.setSectionDisplay('appletoken_basedauthentication', true);
    g_form.setSectionDisplay('applecertificate_basedauthentication', false);
    var tabIndex = g_tabs2Sections.findTabIndexByName('appletoken_basedauthentication');
    g_tabs2Sections.setActive(tabIndex);
}
