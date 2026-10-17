function onLoad() {
    if (g_form.getValue('type') == 'COMPOUND' &&  g_form.getEditableFields().length > 0) {

        createPicker();
    } else {
        removePicker();
    }
}

function createPicker() {
    var searchIconHTML = '<a href="#" id="select_compund_activity" tabindex="-1" class="btn btn-default btn-ref reference_decoration icon-search" title="" data-original-title="Lookup using list"></a>';
    g_form.getControl("field").parentElement.parentElement.lastChild.innerHTML = searchIconHTML;
    jQuery('#select_compund_activity').click(openCompoundActivityPicker);
    var field = g_form.getValue('field');
    if (field) {
        var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
        gaProminUtil.addParam('sysparm_name', 'getLabelForCompoundActivityField');
        gaProminUtil.addParam('sysparm_tableName', g_form.getReference('entity').table);
        gaProminUtil.addParam('sysparm_compoundFields', g_form.getValue("field"));
        gaProminUtil.getXMLWait();
        var fieldList = JSON.parse(gaProminUtil.getAnswer());
        setTimeout(function(fieldList) {
            jQuery("#sys_display\\.promin_activity_def\\.field").text(fieldList["compoundActivityLabel"]);
        }, 2000, fieldList);
    }

}

function removePicker() {
    jQuery('#select_compund_activity').remove();
}

function openCompoundActivityPicker() {

    var dialog = new GlideDialogWindow("po_select_compound_activity_field_value");
    dialog.setTitle("Select '" + g_form.getValue("entity.table") + "' field values");
    dialog.setPreference('sysparm_entityId', g_form.getValue("entity"));
    dialog.setWidth(650);
    dialog.render();
}
