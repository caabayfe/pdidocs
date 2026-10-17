var LOG_PREFIX = "[fix_script_schedules_properties_rw_roles_update]: ";
try {
    gs.info(LOG_PREFIX + "Loading the fix script");
    updateSchedulesPropertiesReadWriteRoles();
    gs.info(LOG_PREFIX + "Completed running the fix script");
} catch (e) {
    gs.error(LOG_PREFIX + "An exception occurred while running the fix script: ", e);
}

function updateSchedulesPropertiesReadWriteRoles() {
    var schedulesProperties = [
        "com.glide.schedules.log.level",
        "glide.schedules.fifth",
        "glide.schedules.log.debug",
        "glide.schedules.repeat_nth",
        "glide.schedules.schedule_entry_max_span",
        "nextui_calendar.user.role"
    ];

    var sysPropGr = new GlideRecord("sys_properties");
    if (sysPropGr.isValid()) {
        sysPropGr.addQuery("name", "IN", schedulesProperties);
        sysPropGr.setWorkflow(false);
        sysPropGr.query();
        while (sysPropGr.next()) {
            sysPropGr.setValue("read_roles", "sn_schedules_admin");
            sysPropGr.setValue("write_roles", "sn_schedules_admin");
            sysPropGr.update();
            gs.info(LOG_PREFIX + "Read/write roles of property " + sysPropGr.getValue('name') + " with sys_id " + sysPropGr.getUniqueValue() + " updated");
        }
    }
}
