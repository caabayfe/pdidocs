function onSubmit() {
	if (g_form.getValue("filter_by").toString() == "true" && g_form.getValue("rule").toString() == "") {
		g_form.showFieldMsg("filter_by", getMessage("Rule should not be empty if 'Filter by' is checked."), "error");
		g_form.submitted = false;
        return false;
    }
}
