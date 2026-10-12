function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (g_form.getValue("type") != "DEFAULT") {
        jQuery("#grouped_activity_annotation").parent().hide();
        jQuery("#activity_of_interest_annotation").parent().hide();
		jQuery("#include_empty_start_annotation").parent().hide();
    } else {
        jQuery("#grouped_activity_annotation").parent().show();
		jQuery("#include_empty_start_annotation").parent().show();
        if (g_form.getValue("field_values_selection_type") != "ALL") {
            jQuery("#activity_of_interest_annotation").parent().hide();
        } else {
            jQuery("#activity_of_interest_annotation").parent().show();
        }
    }
}
