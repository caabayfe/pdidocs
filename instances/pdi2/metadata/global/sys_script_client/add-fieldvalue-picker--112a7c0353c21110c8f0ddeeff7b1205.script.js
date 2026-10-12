function onLoad() {
    if (g_form.getEditableFields().length > 0) {
        var searchIconHTML = '<a href="#" id="select_finding_rule_value" onclick="javascript:openFieldValuePickerForCondition()" tabindex="-1" class="btn btn-default btn-ref reference_decoration icon-search hide" title="" data-original-title="Lookup using list"></a>';
        g_form.getControl("field_display_value").parentElement.parentElement.lastChild.innerHTML = searchIconHTML;
    }
}

function openFieldValuePickerForCondition() {

	var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
    gaProminUtil.addParam('sysparm_name', 'getLabelForSelectedField');
    gaProminUtil.addParam('sysparm_tableName', g_form.getValue('table'));
    gaProminUtil.addParam('sysparm_selectedField', g_form.getValue("field"));
    gaProminUtil.getXMLWait();
    var fieldList = JSON.parse(gaProminUtil.getAnswer());
    var selectedField = fieldList["selected_field"];
    var fieldValue = g_form.getValue('field');
	var fieldLabel = '';
	if (fieldValue != '' && selectedField.length > 0) {
        fieldLabel = selectedField.toString();
    }
	var tableName = g_form.getValue("table");
    if (tableName.startsWith("ar_")) {
        tableName = tableName.replace("ar_", "");
    }

    var dialog = new GlideDialogWindow("po_select_finding_rule_value");
    dialog.setTitle("Select '" + fieldLabel + "' field value");
    dialog.setPreference('sysparm_table', tableName);
    dialog.setPreference('sysparm_field', g_form.getValue("field"));
    dialog.setPreference('sysparm_fieldLabel', fieldLabel);
    dialog.setPreference('sysparm_defaultValue', g_form.getValue("field_value") || "");
    dialog.setPreference('sysparm_defaultDisplayValue', g_form.getValue("field_display_value") || "");
    dialog.setPreference('sysparm_predicate', g_form.getValue("predicate") || "");
    dialog.setPreference('sysparm_disable_lookup', isLookUpDisabled());
	dialog.setPreference('sysparm_displayFieldName', "field_display_value");
	dialog.setPreference('sysparm_fieldName', "field_value");
    dialog.setWidth(650);
    dialog.render();

}

function isLookUpDisabled() {
    var lookupBtn = jQuery('#lookup\\.promin_finding_def_condition\\.finding_def button');
    if (lookupBtn.length == 1) {
        return lookupBtn.attr('disabled') == 'disabled';
    }
    return false;
}
