setRefQual();

function setRefQual(){
	if (isSimple(current.reference_qual)) {
		current.use_reference_qualifier = 'simple';
		current.reference_qual_condition = current.reference_qual.trim();
		current.dynamic_ref_qual = "";
		safeUpdate();
		return;
	}
	
	if (isAdvanced(current.reference_qual)) {
		current.use_reference_qualifier = 'advanced';
		current.reference_qual_condition = "";
		current.dynamic_ref_qual = "";
		safeUpdate();
		return;
	}
	
	var currentReferenceQual = current.reference_qual.trim();
	currentReferenceQual = currentReferenceQual.substring("javascript:".length);
	if (currentReferenceQual == "") {
		current.use_reference_qualifier = 'simple';
		current.reference_qual_condition = "";
		current.dynamic_ref_qual = "";
		current.reference_qual = "";
		safeUpdate();
		return;
	}
	
	if (currentReferenceQual.endsWith(";"))
		currentReferenceQual = currentReferenceQual.substring(0, currentReferenceQual.length - 1);
		
	var dyn = new GlideRecord("sys_filter_option_dynamic");
	dyn.addQuery("script", currentReferenceQual).addOrCondition("script", currentReferenceQual + ";");
	dyn.query();
	if (dyn.next()) {
		current.reference_qual_condition = "";
		current.use_reference_qualifier = 'dynamic';
		current.dynamic_ref_qual = dyn.sys_id;
	} else {
		current.reference_qual_condition = "";
		current.dynamic_ref_qual = "";
		current.use_reference_qualifier = 'advanced';
	}
	
	safeUpdate();
}

function isSimple(refQual) {
	return refQual.indexOf("javascript:") == -1;
}

function isAdvanced(refQual) {
	return refQual.trim().indexOf("javascript:") > 0;
}

function safeUpdate() {
	current.setWorkflow(false);
	current.autoSysFields(false);
	current.update();
}
