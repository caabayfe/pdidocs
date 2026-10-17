updateDynamic();
cleanSimple();
cleanDynamic();


function updateDynamic(){
var currentUseReferenceQual = current.use_reference_qualifier; 
	if (((currentUseReferenceQual == 'simple'|| currentUseReferenceQual == 'advanced' ) || currentUseReferenceQual == 'dynamic' ) && !current.dynamic_ref_qual.nil()){
			current.use_reference_qualifier = 'dynamic';
			current.reference_qual = "javascript:" + current.dynamic_ref_qual.script;
	} else {
		current.use_reference_qualifier = 'simple';
		current.reference_qual = "";
		}
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
	
