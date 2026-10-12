function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    if (g_scratchpad.useSchedules) {
        g_form.setDisplay("calendar", false);
        g_form.setDisplay("schedule_source", true);

        var scheduleSource = newValue || g_form.getValue("schedule_source");
        if (scheduleSource === "inactivity_monitor") {
            g_form.setDisplay("schedule", true);
            g_form.setMandatory("schedule", true);
            g_form.setDisplay("timezone_source", true);
            g_form.setMandatory("timezone_source", true);
        } else {
            g_form.setMandatory("schedule", false);
            g_form.setDisplay("schedule", false);
        }

        if (scheduleSource === "task_field") {
            g_form.setDisplay("schedule_source_field", true);
            g_form.setMandatory("schedule_source_field", true);
        } else {
            g_form.setMandatory("schedule_source_field", false);
            g_form.setDisplay("schedule_source_field", false);
        }

        if (!scheduleSource || scheduleSource === "no_schedule") {
            g_form.setMandatory("schedule", false);
            g_form.setDisplay("schedule", false);
            g_form.setMandatory("timezone_source", false);
            g_form.setDisplay("timezone_source", false);
            g_form.setMandatory("timezone_source_field", false);
            g_form.setDisplay("timezone_source_field", false);
            g_form.setDisplay("timezone", false);
        } else {
            if (g_form.getValue("timezone_source") === "inactivity_monitor") {
                g_form.setDisplay("timezone", true);
                g_form.setMandatory("timezone", true);
            } else {
                g_form.setMandatory("timezone", false);
                g_form.setDisplay("timezone", false);
            }

            if (g_form.getValue("timezone_source") === "schedule_tz") {
                g_form.setDisplay("schedule", true);
                g_form.setMandatory("schedule", true);
            }

            if (g_form.getValue("timezone_source") === "task_field") {
                g_form.setDisplay("timezone_source_field", true);
                g_form.setMandatory("timezone_source_field", true);
            } else {
                g_form.setMandatory("timezone_source_field", false);
                g_form.setDisplay("timezone_source_field", false);
            }
        }
    } else {
        g_form.setDisplay("calendar", true);
        g_form.setDisplay("schedule_source", false);
        g_form.setDisplay("schedule", false);
        g_form.setMandatory("schedule_source_field", false);
        g_form.setDisplay("schedule_source_field", false);
        g_form.setDisplay("timezone", false);
        g_form.setDisplay("timezone_source", false);
        g_form.setMandatory("timezone_source_field", false);
        g_form.setDisplay("timezone_source_field", false);
    }
}
