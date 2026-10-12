var confirmButton = document.getElementById('confirm_cancel');
var dismissButton = document.getElementById('dismiss_cancel');
var textArea = document.getElementById('reason_to_cancel');

textArea.addEventListener('input', function checkReasonField(event) {
    confirmButton.disabled = event.target.value === "";
});

confirmButton.addEventListener('click', function confirm() {
    confirmButton.disabled = true;
    dismissButton.disabled = true;
    requestCancel(textArea.value);
});

function requestCancel(reason) {
	var ajax = new GlideAjax('CancelProcessesAjax');
	ajax.addParam('sysparm_reason', reason);
	ajax.addParam('sysparm_selectedProcesses', '${JS:sysparm_selectedProcesses}');
	ajax.addParam('sysparm_name', 'cancelProcessess');
	ajax.getXMLAnswer(function reloadPage() {
		g_navigation.reloadWindow(window);
	});
}
