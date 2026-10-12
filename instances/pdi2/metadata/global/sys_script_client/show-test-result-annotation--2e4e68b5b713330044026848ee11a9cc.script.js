function onLoad() {

	// Only show the annotation if there's actually a message to show
	var msg = g_scratchpad.atf_result_annotation;
	if (msg) {
		// getControlByForm() can return either one control or multiple if there is more than one matching control (e.g. across different sections)
		var control = g_form.getControlByForm("first_failing_step.summary");

		if (control) {
			// If control.length is defined there was more than one match
			if (control.length) {
				// Apply the annotation to all matching controls
				control.forEach(function(i) {
					g_form.showFieldMsg(i, msg);
				});
			} else // Only one match so just apply the annotation once
				g_form.showFieldMsg(control, msg);

			// Find all the field messages (could be more than one if there was more than one control) and convert them from plainext to HTML
			var annotations = document.querySelectorAll("[id='sys_atf_test_result.first_failing_step.summary_fieldmsg']");
			annotations.forEach(function(annotation) {
				var child = annotation.firstChild;
				if (child)
					child.innerHTML = child.innerText;
			});
		}
	}

}
