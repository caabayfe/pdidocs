function onLoad() {
    if (g_form.isNewRecord())
        return;
    var facetFields = g_form.getValue('ais_facet_name');
    var type = g_form.getValue('type');
    var ga = new GlideAjax('ValidateFacets');
    ga.addParam('sysparm_name', 'validate_facet_type');
    ga.addParam('sysparm_facet_field', facetFields);
    ga.addParam('sysparm_type', type);
    ga.getXMLAnswer(updateField);

    function updateField(answer) {
        g_form.removeDecoration('type', 'icon-check-circle', 'Valid', 'color-green');
        if (answer == "error_date_type") {
            g_form.flash("type", "#FFDADC", 0);
            g_form.showErrorBox('type', nowapi.g_i18n.format(
                getMessage("Invalid type, date field only supports Single Select")
            ));
            return false;
        } else if (answer == "warning_multi_select_and") {
            g_form.flash("type", "#faf8b2", 0);
            g_form.showFieldMsg('type', nowapi.g_i18n.format(
                getMessage("Invalid type, [Multi Select And] works best with tags and glide_list")
            ), 'warning');
        } else
            g_form.addDecoration('type', 'icon-check-circle', 'Valid', 'color-green');
			
        return true;
    }
}
