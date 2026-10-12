function onSubmit() {
	// checks condition field for improperly formed quota conditions
	// this can prevent the saving of a quota that blocks everything on the system
	var value = g_form.getValue('condition'); 
	
	var blackList = ['STARTSWITH^EQ', 'ENDSWITH^EQ', '!=^EQ', 'LIKE^EQ', '=^EQ', 'CONTAINS^EQ', 
		'NOT IN^EQ', 'typeANYTHING^EQ', 'threadANYTHING^EQ', 'urlANYTHING^EQ'];
		
	if (matchBlackList(blackList, value)) {
		alert(getMessage('The condition you have entered is ambiguous or incomplete. '
		+ 'Conditions for quota rules must be well formed, otherwise quota rules '
		+ 'could be created that block all system transactions.'));
		return false;	
	}		  
}

function matchBlackList(list, val) {
	for (var i = 0; i < list.length; i++) {
		if (val.indexOf(list[i]) >= 0)
			return true;	
	}	
	
	return false;
}
