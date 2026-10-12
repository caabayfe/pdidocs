var atfUtility = new ATFNotificationUtils();
var MAX_TEST_HISTORY = GlideProperties.getInt('sn_atf.schedule.suite_result_email.max_test_history', 10);
var MAX_DEPTH = GlideProperties.getInt('sn_atf.schedule.suite_result_email.max_depth', 20);
if (MAX_DEPTH < 0 || MAX_DEPTH > 100)
	MAX_DEPTH = 20;
var PASS_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.pass_color', '#d3f6d6');
var FAIL_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.fail_color', '#fccac9');
var ERROR_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.error_color', '#ffdcc6');
var SKIP_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.skip_color', '#ffffff');
var CANCEL_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.cancel_color', '#ffffff');
var ONLY_FAILED_RESULTS = GlideProperties.getBoolean('sn_atf.schedule.suite_result_email.only_show_failed_results', true);

printCSS();
setSubjectLine();
printInfo();
printSuiteStats();
printSuiteFailuresWrapper();
printMessage();

function printCSS() {
		template.print(atfUtility.getCSSStyle());
}

function printInfo() {
	template.print('<link href="/styles/heisenberg/source_sans_pro.css" rel="stylesheet"/><link href="/styles/heisenberg/heisenberg_all.css" rel="stylesheet"/>');
	template.print('<div class="heading">');
	var suiteLinkTag = '<a class="link" href="' + gs.getProperty('glide.servlet.uri') + current.getLink() + '">' + current.test_suite.name + '</a>';
	template.print(gs.getMessage('atf_Test Suite: {0}', suiteLinkTag));
	template.print('</div>');
}

function printSuiteStats() {
	template.print('<div class="table_title">'+ gs.getMessage('Suite Stats') + '</div>');
	template.print('<div class="table_wrap">');
	template.print('<table id="pivot_table" class="pivot-2-levels table" cellspacing="0" cellpadding="0">');
	template.print('<tbody>');
	template.print('<tr class ="header-row">');
	template.print('<th class="x-axis-category" style="border:none;"></th>');
	template.print('<th class="x-axis-category">' + gs.getMessage('Suites') + '</th>');
	template.print('<th class="x-axis-category">' + gs.getMessage('Tests') + '</th></tr>');
	template.print('<tr>');
	template.print('<th class="y-axis-category">' + gs.getMessage('atf_Failed ({0})', gs.getMessage('atf_fail_status_abbreviation')) + '</th>');
	template.print('<th class="num" style="background-color:'+ FAIL_COLOR  +';">' + atfUtility.getNumStatusSuites(current, "failure") + '</th>');
	template.print('<th class="num" style="background-color:'+ FAIL_COLOR  +';">' + current.rolled_up_test_failure_count + '</th></tr>');
	template.print('<tr>');
	template.print('<th class="y-axis-category">' + gs.getMessage('atf_Error ({0})', gs.getMessage('atf_error_status_abbreviation')) + '</th>');
	template.print('<th class="num" style="background-color: '+ ERROR_COLOR  +';">' + atfUtility.getNumStatusSuites(current, "error") + '</th>');
	template.print('<th class="num" style="background-color:'+ ERROR_COLOR  +';">' + current.rolled_up_test_error_count + '</th></tr>');
	template.print('<tr>');
	template.print('<th class="y-axis-category">' + gs.getMessage('atf_Skipped ({0})', gs.getMessage('atf_skip_status_abbreviation')) + '</th>');
	template.print('<th class="num" style="background-color: '+ SKIP_COLOR  +';">' + atfUtility.getNumStatusSuites(current, "skipped") + '</th>');
	template.print('<th class="num" style="background-color: '+ SKIP_COLOR  +';">' + getRolledUpCount(current, 'skipped', 0) + '</th></tr>');
	template.print('<tr>');
	template.print('<th class="y-axis-category">' + gs.getMessage('atf_Canceled ({0})', gs.getMessage('atf_cancel_status_abbreviation')) + '</th>');
	template.print('<th class="num" style="background-color: '+ CANCEL_COLOR  +';">' + atfUtility.getNumStatusSuites(current, "canceled") + '</th>');
	template.print('<th class="num" style="background-color: '+ CANCEL_COLOR  +';">' + getRolledUpCount(current, 'canceled', 0) + '</th></tr>');
	template.print('<tr>');
	template.print('<th class="y-axis-category">' + gs.getMessage('atf_Passed ({0})', gs.getMessage('atf_pass_status_abbreviation')) + '</th>');
	template.print('<th class="num" style="background-color:'+ PASS_COLOR  +';">' + atfUtility.getNumSuccessfulSuites(current) + '</th>');
	template.print('<th class="num" style="background-color:'+ PASS_COLOR  +';">' + current.rolled_up_test_success_count + '</th></tr>');
	template.print('<tr>');
	template.print('<th class="y-axis-category">' + gs.getMessage('atf_Total ({0})', gs.getMessage('atf_total_abbreviation')) + '</th>');
	template.print('<th class="num">' + atfUtility.getTotalNumSuites(current.test_suite) + '</th>');
	template.print('<th class="num">' + atfUtility.getTotalTestsInSuite(current) + '</th></tr>');
	template.print('</tbody></table></div></div>');
}

function printSuiteFailuresWrapper(){
	template.print('<div class="table_title" style="margin-bottom:0px;">' + gs.getMessage('Test Suite Results') + '</div>');
	template.print('<div class="table_wrap">');
	template.print('<table id="pivot_table" class="pivot-2-levels table" cellspacing="0" cellpadding="0">');
	template.print('<tbody>');
	printSuiteFailures(current, 1, "", 1);
}

function printSuiteFailures(testSuiteResult, num, totalPathURL, depthCheck) {
		var url = gs.getProperty('glide.servlet.uri') + 'sys_atf_test_suite_result.do?sys_id=' + testSuiteResult.getUniqueValue();
		var tempPathURL = '<a class="link_header" title="' + testSuiteResult.test_suite.name +
			'"href="' + url + '"style="text-decoration: none;">' + num + "." + '</a>';
		totalPathURL += tempPathURL;

		template.print('<tr class ="header-row">');
		template.print('<th class="x-axis-category-test-suite" style="text-align: left; background-color:#e7e9eb;">' + totalPathURL);
		template.print('<a class="link_header" href="' + url + '"style="text-decoration: none;">' + " " + testSuiteResult.test_suite.name + " " + '</a></th>');
		template.print('<th class="x-axis-category-test-suite" colspan="' + MAX_TEST_HISTORY + 1 + '"style="text-align: right; background-color:#e7e9eb;">');

		template.print('<a style="float:right;font-weight: bold;color: #485563;text-decoration:none;">');
		printRolledUpValues(testSuiteResult);
		template.print('</a></th></tr>');

		printFailedTests(testSuiteResult);

		var childSuiteGR = new GlideRecord('sys_atf_test_suite_result');
		childSuiteGR.addQuery('parent.sys_id', testSuiteResult.sys_id);
		childSuiteGR.query();

		depthCheck++;
		if (childSuiteGR.getRowCount() > 0 && depthCheck > MAX_DEPTH) {
			gs.logError("Maximum suite depth was exceeded. No children of this suite will be shown.");
			template.print('<tr><td class="fixed_cell" style="height:23px;border-right: 1px solid #bdc0c4;" colspan="' + MAX_TEST_HISTORY + 1 + '">' + gs.getMessage('Maximum suite depth was exceeded. No children of this suite will be shown.') + '</td></tr>');
			return;
		}
	
		num = 1;
		while(childSuiteGR.next()) {
			printSuiteFailures(childSuiteGR, num, totalPathURL, depthCheck);
			num++;
		}
}

function printRolledUpValues(testSuiteResult) {
	var skipped = getRolledUpCount(testSuiteResult, 'skipped', 0);
	var total = atfUtility.getTotalTestsInSuite(testSuiteResult).toString();
	var cancel = getRolledUpCount(testSuiteResult, 'canceled', 0);
	template.print(gs.getMessage('atf_stats_[ F:1 E:0 S:0 C:0 P:1 T:2 ]', [gs.getMessage('atf_fail_status_abbreviation'), testSuiteResult.rolled_up_test_failure_count, gs.getMessage('atf_error_status_abbreviation'), testSuiteResult.rolled_up_test_error_count, gs.getMessage('atf_skip_status_abbreviation'), ((skipped == 0) ? "0" : skipped), gs.getMessage('atf_cancel_status_abbreviation'), ((cancel == 0) ? "0" : cancel), gs.getMessage('atf_pass_status_abbreviation'), testSuiteResult.rolled_up_test_success_count, gs.getMessage('atf_total_abbreviation'), total])); 
}

function printFailedTests(testSuiteResult) {
	var passingTestResultGA = new GlideAggregate('sys_atf_test_result');
	passingTestResultGA.addQuery('parent.sys_id', testSuiteResult.sys_id);
	passingTestResultGA.addQuery('status', 'IN', ['success', 'success_with_warnings']);
	passingTestResultGA.query();
	
	// find if this suite has passing tests
	var doesSuiteHavePassingTests = passingTestResultGA.getRowCount() > 0;
	
	var testResultGR = new GlideRecord('sys_atf_test_result');
	testResultGR.addQuery('parent.sys_id', testSuiteResult.sys_id);
	//only print tests that did not pass
	if (ONLY_FAILED_RESULTS)
		testResultGR.addQuery('status', 'IN', 'failure, skipped, error, canceled');
	testResultGR.query();
	
	if (testResultGR.getRowCount() == 0) {
		if (doesSuiteHavePassingTests)
			template.print('<tr><td class="fixed_cell" style="height:23px;border-right: 1px solid #bdc0c4;" colspan="' + MAX_TEST_HISTORY + 1 + '">' + gs.getMessage("All member tests on this suite passed.") + '</td></tr>');
		else {
			template.print('<tr><td class="fixed_cell" style="height:23px;border-right: 1px solid #bdc0c4;" colspan="' + MAX_TEST_HISTORY + 1 + '">' + gs.getMessage("This suite does not have any member tests.") + '</td></tr>');
		}
	}
	while(testResultGR.next()) {
		template.print('<tr>');
		template.print('<td class="fixed_cell"><a class="link" href="' + 
						gs.getProperty('glide.servlet.uri') + 'sys_atf_test_result.do?sys_id=' + 
					    testResultGR.getUniqueValue() + '"style="color: #278efc;margin-left: 15px;text-decoration:none">' + testResultGR.test_name + '</a></td>');
		
		addPastResults(testResultGR, testSuiteResult.test_suite.sys_id);	      
		template.print('</tr>');
	}
}

function addPastResults(testResultGR, testSuiteSysId) {
	var count = 0;
	
	var pastTestResultGR = new GlideRecord('sys_atf_test_result');
	pastTestResultGR.addQuery('test.sys_id', testResultGR.test.sys_id);
	// only print test results for tests run in this suite
	pastTestResultGR.addQuery('parent.test_suite', testSuiteSysId);
	pastTestResultGR.orderByDesc('end_time');
	pastTestResultGR.query();
	
	while(pastTestResultGR.next()) {
		var url = gs.getProperty('glide.servlet.uri') + 'sys_atf_test_result.do?sys_id=' + 
					    pastTestResultGR.getUniqueValue();
		
		if (pastTestResultGR.status == 'failure') {
			template.print('<td class="test_fail">');
			template.print('<a title="' + pastTestResultGR.parent.getDisplayValue() + ' ' + pastTestResultGR.parent.end_time.getDisplayValue() + '\n' + pastTestResultGR.output + '" href="' + url + '"style="text-decoration:none; color:#343d47;');
			boldMostRecentResult(count);
			template.print('">' + gs.getMessage('atf_fail_status_abbreviation') + '</a>');
            count++;
		}
		if (pastTestResultGR.status == 'success' ||
			pastTestResultGR.status == 'success_with_warnings' ) {
			template.print('<td class="test_pass">');
			template.print('<a title="' + pastTestResultGR.parent.getDisplayValue() + ' ' + pastTestResultGR.end_time.getDisplayValue() + '\n' + pastTestResultGR.output + '" href="' + url + '"style="text-decoration:none;color:#343d47;');
			boldMostRecentResult(count);
			template.print('">' + gs.getMessage('atf_pass_status_abbreviation') + '</a>');
            count++;
		}
		if (pastTestResultGR.status == 'skipped') {
			template.print('<td class="test_skipped">');
			template.print('<a title="' + pastTestResultGR.parent.getDisplayValue() + ' ' + pastTestResultGR.end_time.getDisplayValue() + '\n' +  pastTestResultGR.output + '" href="' + url + '"style="text-decoration:none;color:#343d47;');
			boldMostRecentResult(count);
			template.print('">' + gs.getMessage('atf_skip_status_abbreviation') + '</a>');
            count++;
		}
		if (pastTestResultGR.status == 'error') {
			template.print('<td class="test_error">');
			template.print('<a title="' + pastTestResultGR.parent.getDisplayValue() + ' ' + pastTestResultGR.end_time.getDisplayValue() + '\n' +  pastTestResultGR.output + '" href="' + url + '"style="text-decoration:none;color:#343d47;');
			boldMostRecentResult(count);
			template.print('">' + gs.getMessage('atf_error_status_abbreviation') + '</a>');
            count++;
		}
		if (pastTestResultGR.status == 'canceled') {
			template.print('<td class="test_canceled">');
			template.print('<a title="' + pastTestResultGR.parent.getDisplayValue() + ' ' + pastTestResultGR.end_time.getDisplayValue() + '\n' +  pastTestResultGR.output + '" href="' + url + '"style="text-decoration:none;color:#343d47;');
			boldMostRecentResult(count);
			template.print('">' + gs.getMessage('atf_cancel_status_abbreviation') + '</a>');
            count++;
		}
			
		template.print('</td>');
		if(count == MAX_TEST_HISTORY)
			break;
	}
	
	// fill row with empty cells if not enough history
	while(count < MAX_TEST_HISTORY) {
		template.print('<td class="cell">  </td>');
		count++;
	}
}

function boldMostRecentResult (mostRecentCount) {
	if (mostRecentCount == 0) 
		template.print('font-weight: bolder; color: #000000');
	return;
}

function getRolledUpCount(testSuiteResult, status, rolledUpCount){
	rolledUpCount += getTestCount(testSuiteResult, status);
	
	var childSuiteGR = new GlideRecord('sys_atf_test_suite_result');
	childSuiteGR.addQuery('parent.sys_id', testSuiteResult.sys_id);
	childSuiteGR.query();

	while(childSuiteGR.next()) {
		rolledUpCount = getRolledUpCount(childSuiteGR, status, rolledUpCount);
	}
	return rolledUpCount;
}

function getTestCount(testSuiteResult, status){
	var testCount = 0;
	var testResultGR = new GlideRecord('sys_atf_test_result');
	testResultGR.addQuery('parent.sys_id', testSuiteResult.sys_id);
	testResultGR.query();
	
	while(testResultGR.next()){
		if(testResultGR.status == status)
			testCount++;
	}
	return testCount;	
}

function printMessage() {
	var width = 280 + 32*MAX_TEST_HISTORY;
	template.print('<div class="normal" style="margin-bottom:10px; font-size:13px;">' + gs.getMessage('Past test results are displayed from newest (show in bold) to oldest.') + '</div>');
	template.print('</tbody></table></div>');
	template.print('<div class="normal" style="margin-top:10px;max-width:' + width + 'px;word-wrap:normal; font-size:13px; color: #485563;">' + gs.getMessage('atf_suite_result_email_text') + '</div>');
}

function setSubjectLine() {
	email.setSubject(gs.getMessage('atf_Test Suite Results for {0} ({1})', [current.test_suite.name, current.end_time.getDisplayValue()])); 
	}
