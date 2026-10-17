checkForUpdateRefQual();
cleanSimple();
cleanDynamic();

function checkForUpdateRefQual() {
	var currentUseReferenceQual = current.use_reference_qualifier;
	if (currentUseReferenceQual == 'simple')
		current.reference_qual = current.reference_qual_condition;
	else if (currentUseReferenceQual == 'dynamic') {
		if (current.dynamic_ref_qual.nil())
			current.reference_qual = "";
		else
			current.reference_qual = "javascript:" + current.dynamic_ref_qual.script;
	} else if (currentUseReferenceQual == 'advanced') {
		var curRef = current.reference_qual.trim();
		curRef = curRef.substring("javascript:".length);
		if (curRef == "")
			return;
			
		if (curRef.endsWith(";"))
			curRef = curRef.substring(0, curRef.length - 1);
			
		var dyn = new GlideRecord("sys_filter_option_dynamic");
		dyn.addQuery("script", curRef).addOrCondition("script", curRef + ";");	
		dyn.query();
		if (dyn.next()) {
			current.use_reference_qualifier = 'dynamic';
			current.dynamic_ref_qual = dyn.sys_id;
		}
	}
	return;	
}

function cleanSimple() {
	var currentUseReferenceQual = current.use_reference_qualifier;
	if (currentUseReferenceQual == 'dynamic') {
		current.reference_qual_condition = null;
	} else if (currentUseReferenceQual == 'advanced'){
		current.reference_qual_condition = null;
	}
}

function cleanDynamic() {
	var currentUseReferenceQual = current.use_reference_qualifier;
	if (currentUseReferenceQual == 'simple') 
		current.dynamic_ref_qual = "";
	 else if (currentUseReferenceQual == 'advanced') 
		current.dynamic_ref_qual = "";
	
}
	
