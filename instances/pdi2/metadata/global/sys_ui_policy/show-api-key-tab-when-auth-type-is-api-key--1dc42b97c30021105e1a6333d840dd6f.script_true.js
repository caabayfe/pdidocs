function onCondition() {
    g_form.setSectionDisplay('googleapi_key', true);
    g_form.setSectionDisplay('googlehttp_v1api', false);
    var tabIndex = g_tabs2Sections.findTabIndexByName('googleapi_key');
    g_tabs2Sections.setActive(tabIndex);
}
