function onCondition() {
    // hide reference specific fields
    g_form.setDisplay('reference_table', false);
    g_form.setDisplay('request_filter_column', false);

    // show non-reference specific fields
    g_form.setDisplay('apply_on_load', true);
    g_form.setDisplay('order', true);
    g_form.setDisplay('available_for', true);
    g_form.setDisplay('not_available_for', true);
    g_form.showRelatedList('sn_ex_sp_request_filter_conditions');
}
