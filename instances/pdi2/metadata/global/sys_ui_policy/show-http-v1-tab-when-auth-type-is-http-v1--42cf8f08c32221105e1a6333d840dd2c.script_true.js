function onCondition() {
    g_form.setSectionDisplay('googlehttp_v1api', true);
    g_form.setSectionDisplay('googleapi_key', false);
    var tabIndex = g_tabs2Sections.findTabIndexByName('googlehttp_v1api');
    g_tabs2Sections.setActive(tabIndex);
}
