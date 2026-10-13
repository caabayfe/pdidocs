validateInput();

function validateInput() {
	// Check that "field" field is valid:
	current.field = current.field.trim();
	if(gs.nil(current.field)) {
		gs.addErrorMessage(gs.getMessage('Invalid "field" field: {0}', [current.field]));
		current.setAbortAction(true);
		return;
	}
	
	var myRegexp = current.regexp;

	if (myRegexp.indexOf("()") >= 0) {
		gs.addErrorMessage(gs.getMessage('empty expression "()" is not allowed in the Regular Expression field'));
		current.setAbortAction(true);
		return;
	}
	
	// count the number of capturing groups in the regexp field:
	var countExpr = 0;
	var matchedRegexp;
	try{
		matchedRegexp = (new RegExp(myRegexp.toString() + '|')).exec('');
	}catch(err){
		try {
		// Just for the sake of field validation, remove any non-regexp "\(" and "\)" expressions:
			myRegexp = myRegexp.replaceAll('\\\(', '');
			myRegexp = myRegexp.replaceAll('\\\)', '');
			//Try use java syntax only if has property
			if(gs.getProperty('evt_mgmt.event_rule.enable_regex_java_syntax', 'false') === 'true'){
				matchedRegexp = (new RegExp(myRegexp.toString() + '|','j')).exec('');
			}else{
				matchedRegexp = (new RegExp(myRegexp.toString() + '|')).exec('');
			}
			
		}catch(err){
			gs.addErrorMessage(gs.getMessage('Invalid Regular Expression field'));
			current.setAbortAction(true);
			return;
		}
	}
		countExpr = matchedRegexp.length - 1;

	// count the number of mapping fields:
	var countFields = 0;
	var mappingArr = current.mapping.split(',');
	if (current.mapping.trim()) {
		countFields = mappingArr.length;
	}
	
	// Check that number of mapping fields matches the number of capturing groups in regexp:
	if (countExpr != countFields) 
		gs.addInfoMessage(gs.getMessage('Note that the number of capturing groups in the "Regular Expression" field does not match the number of "Mapping" fields'));
	
	// Check that all mapping fields are valid:
	if(!gs.nil(current.mapping)){
		for (i = 0; i < mappingArr.length; i++) {
			if(gs.nil(mappingArr[i].trim())) {
				gs.addErrorMessage(gs.getMessage('Invalid "Mapping" field name: {0}', [mappingArr[i].trim()]));
				current.setAbortAction(true);
				return;
			}
		}
	}
}
