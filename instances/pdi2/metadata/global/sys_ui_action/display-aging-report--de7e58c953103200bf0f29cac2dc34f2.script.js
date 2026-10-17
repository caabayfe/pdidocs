displayReport();
function displayReport() {
	var testSuiteResultIds = getTestSuiteResultIds(current.sys_id);
	if (!testSuiteResultIds || testSuiteResultIds.length == 0) {
		gs.addInfoMessage(gs.getMessage("There are no test suite result records corresponding to this test suite to show the aging report"));
		action.setRedirectURL(current);
	} else {
		var reportId = generateAgingReport(testSuiteResultIds);
		var report = new GlideReport(reportId);
		report.publish();
		gs.setRedirect("/sys_report_display.do?sysparm_report_id=" + reportId);
	}
}

function getTestSuiteResultIds(testSuiteSysId) {
	// get the number of test suite results to be displayed in the aging report
	var suiteResultCountThreshold = GlideProperties.getInt("sn_atf.schedule.reports.suite.aging_threshold", 25);
	if (suiteResultCountThreshold < 1 || suiteResultCountThreshold > 100)
		suiteResultCountThreshold = 25;

	var gr = new GlideRecord("sys_atf_test_suite_result");
	gr.addQuery("test_suite", testSuiteSysId);
	gr.orderByDesc("start_time");
	gr.setLimit(suiteResultCountThreshold);
	gr.query();

	var testSuiteResultIds;
	while (gr.next()) {
		if (testSuiteResultIds)
			testSuiteResultIds += "," + gr.sys_id;
		else
			testSuiteResultIds = gr.sys_id + "";
	}
	return testSuiteResultIds.split(",");
}

/**
 * Generate a report record and return the sys_id
 */
function generateAgingReport(testSuiteResultIds) {
	var report = new GlideRecord("sys_report");
	report.table = "sys_atf_test_result";
	// Set the description to the english string below, which will be used by the table cleaner to delete the reports
	report.description = "This report was automatically generated and will be deleted automatically by a Table Cleaner. Please do not alter this text.";
	report.filter = getAgingReportFilter(testSuiteResultIds);
	report.title = gs.getMessage("Test suite aging report");
	report.field = "parent.base_suite_result.start_time";
	report.trend_field = "status";
	report.aggregate = "COUNT";
	report.other_threshold = -1;
	report.type = "bar";
	report.bar_unstack = false;
	report.chart_size = "large";
	report.sumfield = "run_time";
	report.field_list = "start_time,test_suite,status,run_time";
	report.exp_report_attrs = true;
	report.compute_percent = "aggregate";
	report.direction = "minimize";
	report.gauge_autoscale = true;
	report.chart_title_color = "65b30218a9fe3dba0120df8611520d97";
	report.x_axis_title = gs.getMessage("Test suite results");
	report.y_axis_title = "";
	report.set_color = "chart_colors";
	return report.insert();
}

/**
 * Generate the filter to be used in the report, so that only test results belong to the hierarchy of any of the
 * test suite results passed are included in the report
 */
function getAgingReportFilter(testSuiteResultIds) {
	var filter = "";
	for (var i = 0; i < testSuiteResultIds.length; i++) {
		var subFilter = getAgingFilterForSuiteResult(testSuiteResultIds[i]);
		if (filter == "")
			filter = subFilter;
		else
			filter += "^OR" + subFilter;
	}
	filter += "^EQ^ORDERBYDESCparent.base_suite_result.start_time^GROUPBYparent.base_suite_result.start_time^EQ^TRENDBYparent,year";
	return filter;
}

function getAgingFilterForSuiteResult(testSuiteResultId) {
	var gr = new GlideRecord("sys_atf_test_suite_result");
	if (!gr.get(testSuiteResultId))
		return "";

	// if this is the base suite, the filter is simple, all test results that belong to test suites with this suite as the base_suite_result
	if (gr.base_suite_result == testSuiteResultId)
		return "parent.base_suite_result=" + testSuiteResultId;

	// if this is not the base suite, get all the test suite results in this hierarchy
	var testSuiteResultsInHierarchy = [];
	getSuiteResultsInHierarchy(testSuiteResultId, testSuiteResultsInHierarchy);
	return "parent.sys_idIN" + testSuiteResultsInHierarchy.join(",");
}

/**
 * Get the sys_ids of all the test suite results that are below the passed test suite result in the hierarchy
 */
function getSuiteResultsInHierarchy(testSuiteResultId, testSuiteResultsInHierarchy) {
	testSuiteResultsInHierarchy.push(testSuiteResultId);
	var gr = new GlideRecord("sys_atf_test_suite_result");
	gr.addQuery("parent", testSuiteResultId);
	gr.query();
	while (gr.next())
		getSuiteResultsInHierarchy(gr.sys_id + "", testSuiteResultsInHierarchy);

}
