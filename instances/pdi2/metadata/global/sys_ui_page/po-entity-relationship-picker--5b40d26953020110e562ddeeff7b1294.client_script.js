//set default value when popup is opened 2nd time
var defaultValue = gel('defaultValue').value;
if (defaultValue != '') {
    jQuery("#refField").val(defaultValue);
}

function onCancel() {
    var c = gel('cancelled');
    c.value = "true";
    GlideDialogWindow.get().destroy();
    return false;
}

function updateFieldValue() {
    var fieldValue = gel('refField').value;
    var relation = g_form.getValue('relation_type');
    if (relation == 'CHILD') {
        g_form.setValue("source_field", fieldValue);
    }
    if (relation == 'REFERENCE') {
        g_form.setValue("target_field", fieldValue);
    }
    GlideDialogWindow.get().destroy();
    return true;

}
