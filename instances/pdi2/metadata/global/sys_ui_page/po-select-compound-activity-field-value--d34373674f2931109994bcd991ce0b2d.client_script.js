function updateCompoundFieldValue() {
	
    var compoundSelectOptionList = document.getElementById("compoundSelectList").options;
    var selectedOptions = [];
    for (i = 0; i < compoundSelectOptionList.length; i++) {
        if (compoundSelectOptionList[i].selected) {
            selectedOptions.push({
                "field": compoundSelectOptionList[i].value,
                "label": compoundSelectOptionList[i].label
            });
        }
    }
    GlideDialogWindow.get().destroy();
    selectedOptionsLabel = "";
    selectedOptionsValue = "";
    selectedOptions.forEach((item, index) => {
        if (index == 0) {
            selectedOptionsLabel += item.label;
            selectedOptionsValue += item.field;
        } else {
            selectedOptionsLabel += "," + item.label;
            selectedOptionsValue += "," + item.field;
        }
    });

	g_form.setValue("change_name",selectedOptionsLabel+" Changed")
    jQuery("#promin_activity_def\\.field").val(selectedOptionsValue);
	jQuery("#sys_display\\.promin_activity_def\\.field").text(selectedOptionsLabel);

    return selectedOptions;
}

function onCancel() {
    var c = gel('cancelled');
    c.value = "true";
    GlideDialogWindow.get().destroy();
    return false;
}
