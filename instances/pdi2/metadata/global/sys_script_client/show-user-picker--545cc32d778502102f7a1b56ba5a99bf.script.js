function onLoad() {
    if (g_form.getEditableFields().length > 0) {
        var searchIconHTML = '<a href="#" id="select_user_field_values" onclick="javascript:openUserValuePicker()" tabindex="-1" class="btn btn-default btn-ref reference_decoration icon-search" title="" data-original-title="Lookup using list" aria-label="Look up users"></a>';
        g_form.getControl("system_generated_user_display_values").parentElement.parentElement.lastChild.innerHTML = searchIconHTML;
    }
}

function openUserValuePicker() {
    var dialog = new GlideDialogWindow("po_select_user_value");
    dialog.setTitle("Enter system-generated work notes Usernames");
    dialog.setPreference('sysparm_defaultValue', g_form.getValue("system_generated_user_values") || "");
    dialog.setPreference('sysparm_defaultDisplayValue', g_form.getValue("system_generated_user_display_values") || "");
    dialog.setPreference('sysparm_predicate', "IN");
	dialog.setPreference('sysparm_displayFieldName', "system_generated_user_display_values");
	dialog.setPreference('sysparm_fieldName', "system_generated_user_values");
    dialog.setWidth(650);
    dialog.render();
}
