function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var topDeleteButton = document.getElementById("sysverb_delete");
    var bottomDeleteButton = document.getElementById("sysverb_delete_bottom");
    if (newValue === 'true' || g_form.getValue("table") === 'cmdb_ci') {
		if (topDeleteButton) {
			topDeleteButton.setAttribute("disabled","true");
		}
		if (bottomDeleteButton) {
			bottomDeleteButton.setAttribute("disabled","true");
		}
    } else {
		if (topDeleteButton) {
			topDeleteButton.removeAttribute("disabled");
		}
		if (bottomDeleteButton) {
			bottomDeleteButton.removeAttribute("disabled");
		}
    }
}
