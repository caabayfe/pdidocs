function onLoad() {
    g_form.showFieldMsg(
		"max_drift", 
		getMessage("It is recommended to set the max drift and use a random day and time of the month when running jobs that include AI scans to reduce load on the LLM server"), 
		"info"
	);
}
