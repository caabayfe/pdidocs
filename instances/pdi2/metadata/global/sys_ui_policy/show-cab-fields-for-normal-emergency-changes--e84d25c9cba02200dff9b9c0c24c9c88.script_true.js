function onCondition() {
	// in Service Portal the "isFieldVisible" function is named "isVisible" 
	var isVisibleFuncName = typeof g_form.isFieldVisible === "function" ? "isFieldVisible" : "isVisible";

	// if both fields are not visible on the form then no action is needed
	if (!(g_form[isVisibleFuncName]("cab_date") && g_form[isVisibleFuncName]("cab_date_time")))
		return;

	// if the new "cab_date_time" field has a value or if the original "cab_date" field is empty then we can show the new field
	var showNewCABDateField = false;
	if (g_form.getValue("cab_date_time") !== "" || g_form.getValue("cab_date") === "")
		showNewCABDateField = true;

	g_form.setDisplay("cab_date", !showNewCABDateField);
	g_form.setDisplay("cab_date_time", showNewCABDateField);
}
