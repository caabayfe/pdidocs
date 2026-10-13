new DiscoveryJSONSensor({

	processJSON: function() {
		// current is the new state of the CI
		// Validate, remove start_date to be safe.
		if (JSUtil.nil(current.start_date) || current.start_date <= 0) {
			delete current.start_date;
			return;
		}

		var gr = new GlideRecord('cmdb_ci');
		var sys_id = g_probe.getParameter('ci_sys_id');
		if (sys_id)
			gr.get('sys_id', sys_id);

		// if it is the first time discovering the CI, use the current start date
		var gdt = new GlideDateTime();
		gdt.setValue(current.start_date);
		if (JSUtil.nil(gr.start_date)) {
			current.start_date = gdt.getValue();
			return;
		}

		var prevGDT = new GlideDateTime();
		prevGDT.setValue(gr.start_date);

		// threshold of two minutes
		var threshold = 2 * 60 * 1000;

		// only update start date if the previous and current differ by more than the threshold
		if(Math.abs(prevGDT.getNumericValue()-gdt.getNumericValue()) <= threshold) {
			current.start_date = prevGDT.getValue();
		}
		else {
			current.start_date = gdt.getValue();
		}
	},

	type: "DiscoveryJSONSensor"
});
