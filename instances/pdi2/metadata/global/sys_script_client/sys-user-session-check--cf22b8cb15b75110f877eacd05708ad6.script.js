function onChange(control, oldValue, newValue, isLoading, isTemplate) {
		if (isLoading || newValue === '') {
			return;
		}
		var ageNewValue = g_form.getIntValue('age');

		if (ageNewValue < 86400) {
			var gwt = new GwtMessage();
			g_form.showFieldMsg('age', gwt.getMessage('Table cleaner entry was set to clean records less than 24 hrs (86400 seconds) old. Settings of less than 24 hrs can result in missing session statistics data.'));
			}

}
