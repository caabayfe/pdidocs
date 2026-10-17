var SELECT_ATLEAST_TWO = "Select at least two test results to compare";
var ERROR = "Error";
var messages = new GwtMessage().getMessages([SELECT_ATLEAST_TWO, ERROR]);
function generateParameterizedTestReport() {
	var testResultIds = g_list.getChecked();
	var testResultSysIds = testResultIds.split(",");
	if (testResultSysIds.length < 2) {
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var dialog = new dialogClass("glide_alert_standard");
		dialog.setPreference("title", messages[SELECT_ATLEAST_TWO]);
		dialog.setPreference("focusTrap", true);
		dialog.setTitle(messages[ERROR]);
		dialog.setPreference("warning", true);
		dialog.render();
		return;
	}
	var ga = new GlideAjax("ATFReportAjax");
	ga.addParam("sysparm_name", "getPublishedParameterizedTestResultReportId");
	ga.addParam("sysparm_parameterized_test_result_ids", testResultIds);
	ga.getXMLAnswer(function (answer) {
		console.log(answer);
		if (!answer)
			return;
		window.location = "/sys_report_display_no_public.do?sysparm_report_id=" + answer;
	});
}
