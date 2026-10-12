function onLoad() {
    if (g_form.getEditableFields().length > 0) {
        var searchIconHTML = '<a href="#" id="select_activity_field_values" onclick="javascript:openActivityFieldValuePicker()" tabindex="-1" class="btn btn-default btn-ref reference_decoration icon-search" title="" data-original-title="Lookup using list"></a>';
        g_form.getControl("field_display_values").parentElement.parentElement.lastChild.innerHTML = searchIconHTML;
    }
}

function openActivityFieldValuePicker() {
    var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
    gaProminUtil.addParam('sysparm_name', 'getLabelForSelectedField');
    gaProminUtil.addParam('sysparm_tableName', g_form.getReference('entity').table);
    gaProminUtil.addParam('sysparm_selectedField', g_form.getValue("field"));
    gaProminUtil.getXMLWait();
    var fieldList = JSON.parse(gaProminUtil.getAnswer());
    var selectedField = fieldList["selected_field"];
    var fieldValue = g_form.getValue('field');
	var fieldLabel = '';
	if (fieldValue != '' && selectedField.length > 0) {
        fieldLabel = selectedField.toString();
    }

	var source = g_form.getReference('entity').source_type;
	var table = g_form.getReference('entity').table;
	if(source == 'ARCHIVED_DATA' && table.startsWith("ar_")){
		table = table.replace("ar_", "");
	}

    var dialog = new GlideDialogWindow("po_select_finding_rule_value");
    dialog.setTitle("Select '" + fieldLabel + "' field values");
    dialog.setPreference('sysparm_table', table);
    dialog.setPreference('sysparm_field', g_form.getValue("field"));
    dialog.setPreference('sysparm_fieldLabel', fieldLabel);
    dialog.setPreference('sysparm_defaultValue', g_form.getValue("field_values") || "");
    dialog.setPreference('sysparm_defaultDisplayValue', g_form.getValue("field_display_values") || "");
    dialog.setPreference('sysparm_predicate', "IN");
	dialog.setPreference('sysparm_displayFieldName', "field_display_values");
	dialog.setPreference('sysparm_fieldName', "field_values");
    dialog.setWidth(650);
    dialog.render();
}
