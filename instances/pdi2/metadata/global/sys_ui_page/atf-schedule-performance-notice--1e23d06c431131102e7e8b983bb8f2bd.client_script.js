var perfPauseCheckbox = document.getElementById("perfPauseAcknowledged");
var submitButton = document.getElementById("submit_button");
submitButton.disabled = true;

perfPauseCheckbox.addEventListener("change", function() {
	if (this.checked)
		submitButton.disabled = false;
	else
		submitButton.disabled = true;
});

function submitPerformanceSchedule() {
	var gdw = GlideDialogWindow.get();
	var acknowledgeFn = gdw.getPreference('acknowledge');
	acknowledgeFn();
}
