function onLoad() {
	var topDeleteButton = document.getElementById("sysverb_delete");
	var bottomDeleteButton = document.getElementById("sysverb_delete_bottom");
	if (g_form.getValue("active") === 'true' || g_form.getValue("table") === "cmdb_ci") {
		if (topDeleteButton) {
			topDeleteButton.setAttribute("disabled","true");
		}
		if (bottomDeleteButton) {
			bottomDeleteButton.setAttribute("disabled","true");
		}
	}
}
