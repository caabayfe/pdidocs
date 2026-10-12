function onSubmit() {
	var showErrorMsg = function(errorMsg){
		g_form.clearMessages();
		g_form.addErrorMessage(errorMsg);
	};
	if (typeof validateStartDateBeforeEndDate === "function")
		return validateStartDateBeforeEndDate("work_start", "work_end", showErrorMsg);
}
