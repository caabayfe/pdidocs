function onLoad() {
	// Disable the 'Remediate' button when task is 'Work in Progress' or 'Closed Complete'
	if(g_form.getValue('state') == 2 || g_form.getValue('state') == 3) {
		var matches = document.querySelectorAll("#run_remediation_form, #run_remediation_form_bottom");
		
		for(var i = 0; i < matches.length; i++) {
			matches[i].disabled = true;
		}
	}
}
