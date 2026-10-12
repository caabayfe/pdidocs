//set default value when popup is opened 2nd time
var type = gel('fieldType').value;
var isExternalDataTable = gel('isExternalDataTable').value;
var defaultValue = gel('defaultValue').value;
var isMultiSelect = gel('isMultiSelect').value == 'true';
var disableLookup = gel('disableLookup').value == 'true';

if (type == 'boolean') {
    if (defaultValue == "") {
        jQuery("#fieldValue").val("false");
    }
    document.getElementById("ni.fieldValue").checked = (defaultValue == 1);
} else if (type == 'choice') {
    if (isMultiSelect) {
        jQuery('#fieldValue').attr("multiple", "true");
    }
    if (defaultValue != '') {
        if (isMultiSelect) {
            defaultValue = defaultValue.split(",");
        }
        jQuery("#fieldValue").val(defaultValue);
        if (jQuery("#fieldValue").val() == null) { //if the default value is not present in choice list then set to none
            jQuery("#fieldValue").val('');
        }
    }
} else if (type == 'reference') {
    if (disableLookup) {
        jQuery('#lookup\\.fieldValue').attr('disabled', 'disabled');
    }
} else if (isExternalDataTable || type == 'string' || type == 'integer') {
    if (defaultValue != '') {
        jQuery("#fieldValue").val(defaultValue);
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

    if (fieldType == "choice") {
        var selectedChoiceLabels = [],
            selectedChoiceValue = [];
        jQuery("#fieldValue option:selected").each(function() {
            selectedChoiceLabels.push(jQuery(this).text());
            selectedChoiceValue.push(jQuery(this).val());
        });
        updateDisplayValue = selectedChoiceLabels.toString();
        updateValue = selectedChoiceValue.toString();

    } else if (fieldType == 'reference') {
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
    } else if (fieldType == 'boolean') {
        updateDisplayValue = jQuery("#fieldValue").val();
        updateValue = (updateDisplayValue == "true") ? 1 : 0;
    } else if (isExternalDataTable || fieldType == 'string' || fieldType == 'integer') {
        updateValue = jQuery("#fieldValue").val();
        updateDisplayValue = updateValue;
    }

	var displayFieldName = gel('displayFieldName').value;
	var fieldName = gel('fieldName').value;
	
    g_form.setValue(displayFieldName, updateDisplayValue);
    g_form.setValue(fieldName, updateValue);

    GlideDialogWindow.get().destroy();
    return true;

}
