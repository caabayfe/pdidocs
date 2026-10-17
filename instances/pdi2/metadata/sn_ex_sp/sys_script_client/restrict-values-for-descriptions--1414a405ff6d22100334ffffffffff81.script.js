function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var descriptionFieldValues = g_form.getValue("description_fields").split(",");
    var titleFieldValue = g_form.getValue("title_field");

    if (descriptionFieldValues.indexOf(titleFieldValue) > -1) {
        g_form.showFieldMsg("description_fields", getMessage("The field chosen for the title cannot be used in the description."), "error");
        return false;
    } else if (descriptionFieldValues.length > 2) {
        g_form.showFieldMsg("description_fields", getMessage("Maximum of two description fields are allowed to be selected."), "error");
        return false;
    } else {
        g_form.hideFieldMsg("description_fields", true);
    }
    return true;
}
