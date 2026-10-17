function onSubmit() {
	
	var valid = true;
	var critical = g_form.getIntValue("threshold_critical");
	var major = g_form.getIntValue("threshold_major");
	var minor = g_form.getIntValue("threshold_minor");
	var warning = g_form.getIntValue("threshold_warning");
	
	if (g_form.getValue("name") === "Connectors Status") {
		if (critical == 1){ 
			if (major != 0 || minor != 0 || warning != 0) {
				g_form.showErrorBox("threshold_warning" ,getMessage("Invalid values. Only one threshold should be active (1)"));
				return false;
			}

		} else if (major == 1) {
			
			if (critical != 0 || minor != 0 || warning != 0) {
				g_form.showErrorBox("threshold_warning" ,getMessage("Invalid values. Only one threshold should be active (1)"));
				return false;
			}
			
		} else if (minor == 1) {
			
			if (major != 0 || critical != 0 || warning != 0) {
				g_form.showErrorBox("threshold_warning" ,getMessage("Invalid values. Only one threshold should be active (1)"));
				return false;
			}
			
		} else if (warning == 1) {
			
			if (major != 0 || minor != 0 || critical != 0) {
				g_form.showErrorBox("threshold_warning" ,getMessage("Invalid values. Only one threshold should be active (1)"));
				return false;
			}
			
		} else {
			g_form.showErrorBox("threshold_warning" ,getMessage("Invalid values. Only one threshold should be active (1)"));
			return false;

		}
		
		return;
	}
	
	
	
	if (g_form.getBooleanValue("comparison_direction")) { //True means we check rather value is bigger (or equal) to threshold
		if (warning > minor || minor > major || major > critical) {
			g_form.showErrorBox("threshold_warning" ,getMessage("Threshold values should be ordered: critical >= major >= minor >= warning"));
			return false; //Abort the submission
		}
		
	} else {
		if (warning < minor || minor < major || major <critical) { //False means we check rather value is smaller (or equal) to threshold
			g_form.showErrorBox("threshold_warning" ,getMessage("Threshold values should be ordered: critical <= major <= minor <= warning"));
			return false; //Abort the submission
		}
	}

	
}
