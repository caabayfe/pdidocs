function onLoad() {
	var performanceTestField = 'performance_test';

	if (g_scratchpad.disablePerformanceTestField) {
		g_form.setDisabled(performanceTestField, true);
		if (g_scratchpad.disabledPerfFieldMessage != null) {
			// Display dummy field message to create field message div
			g_form.showFieldMsg(performanceTestField, g_scratchpad.disabledPerfFieldMessage, 'info');
			// firstChild gives the <div> element which contains the link
			var performanceTestFieldMsg = gel('sys_atf_schedule.performance_test_fieldmsg').firstChild;
			// Using innerText instead of innerHTML to bypass character processing that adds an ampersand
			var performanceTestFieldMsgHTMl = performanceTestFieldMsg.innerText;
			performanceTestFieldMsgHTMl = performanceTestFieldMsgHTMl.replace(/&lt;/g, '\u003c');
			performanceTestFieldMsgHTMl = performanceTestFieldMsgHTMl.replace(/&gt;/g, '\u003e');
			performanceTestFieldMsg.innerHTML = performanceTestFieldMsgHTMl;
		}
	}
	// Disable 'Run in cloud' option if it's checked and if client runner is not allowed and is a performance run and can run performance in cloud
	else if (!g_scratchpad.isClientRunnerEnabledForPerformance && g_scratchpad.isPerformanceSchedule && g_scratchpad.isRunInCloudChecked && g_scratchpad.isCloudRunnerPerfCompatible)
		g_form.setDisabled('run_in_cloud', true);
}
