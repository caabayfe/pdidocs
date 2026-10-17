function transform(input) {
	var scheduleSysId = input.scheduleSysId;
    var eventRecurrenceControllerInclude = new sn_app_ux_commons.RecurrenceScheduleCRUDManager();
    return eventRecurrenceControllerInclude.getCmnScheduleDetails(scheduleSysId);
}
