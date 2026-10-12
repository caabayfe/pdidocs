checkDyn();

function checkDyn() {

	if (current.isNewRecord()) {
		return;
	}

	if (current.reference_qual.trim().indexOf("javascript:") != 0) {
		current.reference_qual_condition = current.reference_qual.trim();
		return;
	}

	var scr = current.reference_qual.trim();
	scr = scr.substring("javascript:".length);
	if (scr == "")
		return;

	if (scr.endsWith(";"))
		scr = scr.substring(0, scr.length - 1);

	var dyn = new GlideRecord("sys_filter_option_dynamic");
	dyn.addQuery("script", scr).addOrCondition("script", scr + ";");
	dyn.query();
	if (dyn.next()) {
		if (current.use_reference_qualifier != 'advanced')
			current.use_reference_qualifier = 'dynamic';

		current.dynamic_ref_qual = dyn.sys_id;
	} else
		current.use_reference_qualifier = 'advanced';

	current.setWorkflow(false);
	current.autoSysFields(false);
	current.update();
}
