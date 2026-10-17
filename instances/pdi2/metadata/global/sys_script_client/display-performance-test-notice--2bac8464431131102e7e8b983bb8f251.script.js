var gFormAlreadySubmitted = false;
var acknowledgeModal = null;
var performance_test_field = 'performance_test';

function onSubmit() {
	if (gFormAlreadySubmitted || g_scratchpad.isPerfPauseDisabled)
		return true;

	var isPerformanceTest = g_form.getValue(performance_test_field);
	var isPerformanceTestControl = g_form.getControl(performance_test_field);
	if (isPerformanceTest === 'true' && isPerformanceTestControl.changed) {
		openPerfAcknowledgeModal();
		return false;
	}
	else
		return true;
}

function submitPerformanceSchedule() {
	acknowledgeModal.destroy();
	gFormAlreadySubmitted = true;
	gsftSubmit(undefined, g_form.getFormElement(), g_form.getActionName());
}

function openPerfAcknowledgeModal() {
	acknowledgeModal = new GlideModal('atf_schedule_performance_notice');
	acknowledgeModal.setWidth("600");
	acknowledgeModal.setPreference("acknowledge", submitPerformanceSchedule);
	acknowledgeModal.setTitle('Schedule Performance Run');
	acknowledgeModal.render();
}
