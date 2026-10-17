function onCondition() {
    // show reference specific fields
    g_form.setDisplay('reference_table', true);
    g_form.setDisplay('request_filter_column', true);

    // hide non-reference specific fields
    g_form.setDisplay('apply_on_load', false);
    g_form.setDisplay('order', false);
    g_form.setDisplay('available_for', false);
    g_form.setDisplay('not_available_for', false);
    g_form.hideRelatedList('sn_ex_sp_request_filter_conditions');
}
