(function executeRule(current, previous /*null when async*/) {

	var organisationHierarchies = ['business_unit', 'company', 'department'];
	var numberOfOrganisationHierarchiesPopulated = 0;
	for(var i = 0; i < organisationHierarchies.length; i++) {
		if(current.isValidField(organisationHierarchies[i]) && current.getValue(organisationHierarchies[i]))
			numberOfOrganisationHierarchiesPopulated++;
	}
	if(numberOfOrganisationHierarchiesPopulated > 1) {
		gs.addErrorMessage(gs.getMessage('A Strategy can be associated with only one of a Business Unit, Department or Company. Ensure that only one of these fields is populated.'));
		current.setAbortAction(true);
	}

})(current, previous);
