function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.getReference('activity_configuration', hideConfigType);

    function hideConfigType(response) { // reference is passed into callback
        if (response.getValue('primary') == 'false') {
            g_form.setMandatory('title', false);
            g_form.setDisplay('list_view_mapping', false);
            g_form.setDisplay('target_page', false);
            g_form.setSectionDisplay('basic_cardview', false);
            g_form.setSectionDisplay('advanced_cardview', false);
        }
    }

}
