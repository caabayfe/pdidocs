var SELECT_ATLEAST_TWO = "Select at least two test suite results to compare";
var ERROR = "Error";
var messages = new GwtMessage().getMessages([SELECT_ATLEAST_TWO, ERROR]);
function generateReport() {
	var testSuiteResultIds = g_list.getChecked();
	var testSuiteResultSysIds = testSuiteResultIds.split(",");
	if (testSuiteResultSysIds.length < 2) {
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
	ga.addParam("sysparm_name", "getPublishedTestSuiteResultReportId");
	ga.addParam("sysparm_test_suite_result_ids", testSuiteResultIds);
	ga.getXMLAnswer(function (answer) {
		if (!answer)
			return;
		window.location = "/sys_report_display.do?sysparm_report_id=" + answer;
	});
}
