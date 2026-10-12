//set default value when popup is opened 2nd time
var type = gel('fieldType').value;
var defaultValue = gel('defaultValue').value;
var isMultiSelect = gel('isMultiSelect').value == 'true';
var disableLookup = gel('disableLookup').value == 'true';

if (type == 'reference') {
    if (disableLookup) {
        jQuery('#lookup\\.fieldValue').attr('disabled', 'disabled');
    }
} 

function onCancel() {
    var c = gel('cancelled');
    c.value = "true";
    GlideDialogWindow.get().destroy();
    return false;
}

function updateFieldValue() {
    var updateDisplayValue = '',
        updateValue = '';
    var fieldType = gel('fieldType').value;

    if (fieldType == 'reference') {
        if (isMultiSelect) {
            var selectedRefList = [];
            jQuery('#select_0fieldListControl option').each(function() {
                selectedRefList.push(jQuery(this).html());
            });
            updateDisplayValue = selectedRefList.toString();
            updateValue = jQuery('#fieldListControl').val();
        } else {
            updateDisplayValue = gel('sys_display.fieldValue').value;
            updateValue = gel('fieldValue').value;
        }
    }

	var displayFieldName = gel('displayFieldName').value;
	var fieldName = gel('fieldName').value;
	
    g_form.setValue(displayFieldName, updateDisplayValue);
    g_form.setValue(fieldName, updateValue);

    GlideDialogWindow.get().destroy();
    return true;

}
