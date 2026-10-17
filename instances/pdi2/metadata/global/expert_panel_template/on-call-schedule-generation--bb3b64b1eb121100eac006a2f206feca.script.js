// Do not insert a "global" record.
current.setAbortAction(true);

var onCall = new OnCallRotation();
var rotaId;

if (wizard.group_preferences_modified == "true")
	onCall.updateGroupPreferences(wizard.group, wizard.rota_managers, wizard.pto_approval_config, wizard.allow_rota_overlap, wizard.escalation_rule_rota_overlap);

if (wizard.existing_schedule == "Yes") {
	rotaId = onCall.createSimpleRotaFromSchedule(wizard.name, wizard.group, wizard.schedule_type, wizard.duty_rotations, wizard.number_of_reminders, wizard.members, wizard.roster_start, wizard.time_between_reminders, wizard.rotation_interval_type, wizard.rotation_interval_count, wizard.dow_for_rotate, wizard.send_reminders, wizard.reminder_lead_time, wizard.coverage_lead_type, wizard.coverage_interval);
} else {
	var repeatType = (wizard.repeats == "NULL_OVERRIDE" ? "none" : wizard.repeats);
	var allDay = wizard.all_day == "Yes";

	rotaId = onCall.createSimpleRotaNewSchedule(wizard.name, wizard.group, wizard.time_zone,  wizard.shift_start, wizard.shift_end, repeatType, allDay, wizard.duty_rotations, wizard.number_of_reminders, wizard.roster_start, wizard.members, wizard.time_between_reminders, wizard.new_schedule_name, wizard.rotation_interval_type, wizard.rotation_interval_count, wizard.dow_for_rotate, wizard.send_reminders, wizard.reminder_lead_time, wizard.coverage_lead_type, wizard.coverage_interval);
}

redirect(rotaId);

function redirect(rotaId) {
	var rotaGR = new GlideRecord("cmn_rota");
	rotaGR.get(rotaId);

	if (wizard.send_calendar == "Yes")
		new OCRotaICalendar().sendCalendarURL(rotaGR);

	var ocwUtils = new OnCallWorkbenchUtils();
	var accessDetails = ocwUtils.getAccessDetails(wizard.group + "");
	if (accessDetails.isManager || accessDetails.isMember)
		wizard.redirect =  "$oc_workbench.do?sysparm_group_id=" + wizard.group;
	else {
		// Redirect to display the roster schedule
		var stack = gs.generateURL(rotaGR.getTableName(), rotaId);
		stack = stack.replace(/\&/g, "%26");
		stack = stack.replace(/\?/g, "%3F");
		wizard.redirect = new OnCallRotationProcessor().getScheduleUrl(rotaGR.schedule+'').setAttribute('sysparm_stack', stack).setScheduleParams().getUrl();
	}
}
