function onCondition() {
    var grpActivities = g_form.getValue("track_change");
    if (grpActivities == "false") {
        g_form.setValue("track_change", true);
    }
	g_form.setValue("field_values_selection_type", "ALL");
}
