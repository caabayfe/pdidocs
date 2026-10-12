setRefQualFields();

function setRefQualFields() {
	if (current.use_reference_qualifier == 'dynamic') {
		if (current.dynamic_ref_qual.script.nil())
			current.reference_qual = "";
		else
			current.reference_qual = "javascript:" + current.dynamic_ref_qual.script;
	} else if (current.use_reference_qualifier == 'simple')
		current.reference_qual = current.reference_qual_condition;
}
