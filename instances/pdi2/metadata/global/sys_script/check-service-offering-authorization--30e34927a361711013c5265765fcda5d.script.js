(function executeRule(current, previous /*null when async*/ ) {
	var spmUtils = new global.SPMUtilsFactory();
	var answer = true;
	var type="", name="";
    if (!gs.nil(current.csdm_service_offering)) {
        answer = (spmUtils.getUtils()).checkOfferingAuthorization(current.csdm_service_offering);
		type = "Service offering";
		name = current.csdm_service_offering.getDisplayValue();
    } else if (!gs.nil(current.csdm_service)) {
        answer = (spmUtils.getUtils()).checkServiceAuthorization(current.csdm_service);
		type = "Service";
		name = current.csdm_service.getDisplayValue();
    }

	if(!answer) {
		gs.addErrorMessage(gs.getMessage("You cannot map {0} - {1} due to insufficient access privileges!", [name, type]));
		current.setAbortAction(true);
	}

})(current, previous);
