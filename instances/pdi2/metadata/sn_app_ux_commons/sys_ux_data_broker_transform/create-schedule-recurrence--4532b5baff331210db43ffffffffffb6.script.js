function transform(input) {
    if (input.scheduleRecurrence.scheduleSysId) {
        return new sn_app_ux_commons.RecurrenceScheduleCRUDManager().updateRecurrenceSchedule(input.scheduleRecurrence.scheduleSysId, input.scheduleRecurrence);
    }
    return new sn_app_ux_commons.RecurrenceScheduleCRUDManager().createRecurrenceSchedule(input.scheduleRecurrence);
}
