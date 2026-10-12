updateRefQual();
cleanSimple();
cleanDynamic();

function updateRefQual(){
	if (current.reference_qual.trim().indexOf("javascript:") != 0) {   
		current.reference_qual_condition = current.reference_qual.trim();
		current.use_reference_qualifier = 'simple';
		return;
	} 
	
	var currentReferenceQual = current.reference_qual.trim();
	currentReferenceQual = currentReferenceQual.substring("javascript:".length);
	if (currentReferenceQual == "")
		return;
		
	if (currentReferenceQual.endsWith(";"))
		currentReferenceQual = currentReferenceQual.substring(0, currentReferenceQual.length - 1);
		
	var dyn = new GlideRecord("sys_filter_option_dynamic");
	dyn.addQuery("script", currentReferenceQual).addOrCondition("script", currentReferenceQual + ";");	
	dyn.query();
	if (dyn.next()) {
		gs.print("Dynamic: " + currentReferenceQual);
		current.use_reference_qualifier = 'dynamic';
		current.dynamic_ref_qual = dyn.sys_id;
		
	} else
		current.use_reference_qualifier = 'advanced';
}

function cleanSimple() {
	var curUseRef = current.use_reference_qualifier;
	if (curUseRef == 'dynamic') 
		current.reference_qual_condition = "";
	 else if (curUseRef == 'advanced')
		current.reference_qual_condition = "";
}

function cleanDynamic() {
	var curUseRef = current.use_reference_qualifier;
	if (curUseRef == 'simple') 
		current.dynamic_ref_qual = "";
	 else if (curUseRef == 'advanced') 
		current.dynamic_ref_qual = "";
}
	
