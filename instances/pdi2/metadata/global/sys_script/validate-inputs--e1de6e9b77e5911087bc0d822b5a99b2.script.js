validateInput();

function validateInput() {
    /////////////////////////////////////////////////////////////////////////////////////////////
    // Service field validations
    /////////////////////////////////////////////////////////////////////////////////////////////

    // check that the selected Service is in the same domain as user
    if (current.sys_domain != current.service.sys_domain) {
        gs.addErrorMessage(gs.getMessage("The selected service domain {0} does not match the current user's domain {1}", current.service.sys_domain.getDisplayValue(), current.sys_domain.getDisplayValue()));
        current.setAbortAction(true);
    }

	// check that the selected Service is not Discovered service
	if (current.service.type == 2) {
        gs.addErrorMessage(gs.getMessage("The service type can not be Discovered"));
        current.setAbortAction(true);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////
    // CI and CI class fields validations
    /////////////////////////////////////////////////////////////////////////////////////////////

    // check Configuration item and Configuration item class fields cannot both be empty
    if (gs.nil(current.cmdb_ci) && gs.nil(current.cmdb_ci_class)) {
        gs.addErrorMessage(gs.getMessage('The Configuration item and Configuration item class fields cannot both be empty. Specify a value in one of these fields.'));
        current.setAbortAction(true);
    }
    // check Configuration item and Configuration item class fields cannot both be filled
    if (!gs.nil(current.cmdb_ci) && !gs.nil(current.cmdb_ci_class)) {
        gs.addErrorMessage(gs.getMessage('The Configuration item and Configuration item class fields cannot both be filled. Specify a value only in one of these fields.'));
        current.setAbortAction(true);
    }
}
