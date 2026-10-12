function onSubmit() {
    //Type appropriate comment here, and begin script below
    var facetFields = g_form.getValue('ais_facet_name');
    var type = g_form.getValue('type');
    var ga = new GlideAjax('ValidateFacets');
    ga.addParam('sysparm_name', 'validate_facet_type');
    ga.addParam('sysparm_facet_field', facetFields);
    ga.addParam('sysparm_type', type);
    ga.getXMLWait();

    var answer = ga.getAnswer();
    if (answer == "error_date_type") {
        g_form.flash("type", "#FFDADC", 0);
        g_form.showErrorBox('type', nowapi.g_i18n.format(
            getMessage("Invalid type, date field only supports Single Select")
        ));
        return false;
    } else if (answer == "warning_multi_select_and") {
        g_form.flash("type", "#faf8b2", 0);
        g_form.showFieldMsg('type', nowapi.g_i18n.format(
            getMessage("Invalid type, Multi Select And only supports tags and glide_list")
        ), 'warning');
    }
    return true;
}
