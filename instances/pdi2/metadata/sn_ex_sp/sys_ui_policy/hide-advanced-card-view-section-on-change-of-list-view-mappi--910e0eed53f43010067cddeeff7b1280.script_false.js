function onCondition() {
    g_form.clearValue('card_mapping_script');
    g_form.setMandatory('card_mapping_script', false);
    g_form.setSectionDisplay('basic_cardview', true);
    g_form.setSectionDisplay('advanced_cardview', false);
    g_form.setDisplay('target_page', true);
    if (g_form.getValue('target_page') === 'INTERNAL')
        g_form.setDisplay('internal_link', true);
    else
        g_form.setDisplay('external_link', true);

}
