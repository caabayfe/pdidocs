function onSubmit() {
	
	var valid = true;
	var critical = g_form.getIntValue("threshold_critical");
	var major = g_form.getIntValue("threshold_major");
	var minor = g_form.getIntValue("threshold_minor");
	var warning = g_form.getIntValue("threshold_warning");
	
	

		if (warning > minor || minor > major || major > critical) {
			g_form.showErrorBox("threshold_warning" ,getMessage("Threshold values should be ordered: critical >= major >= minor >= warning"));
			return false; //Abort the submission
		}
		
	

	
}
