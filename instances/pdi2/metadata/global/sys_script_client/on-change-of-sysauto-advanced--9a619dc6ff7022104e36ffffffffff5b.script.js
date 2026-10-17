function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    // advanced field must be present on the form to trigger this script

    if (isLoading || newValue === '')
        return;

    var run = g_form.getValue("run_type");
    var active = g_form.getValue("active");
    var advanced = newValue;
    var tz = g_form.getValue("time_zone");

    g_form.setDisplay("run_start", shouldShowRunStart());
    g_form.setDisplay("entered_run_start", shouldShowEnteredRunStart());

    // This logic may execute even when active field is not present on the form (active null/true)
    if (active != "false" && advanced == "false" && run != "once") {
        if (run != "periodically")
            g_form.setValue("run_start", "");

        g_form.setValue("entered_run_start", "");
        g_form.setValue("run_end", "");
        g_form.setValue("entered_run_end", "");
        g_form.setValue("repeat_every", "");
    }

    // Given certain field values, determine whether to display run_start
    function shouldShowRunStart() {
        // Continue if active is null (not on the form) or true
        if (active == "false")
            return false;

        switch (run) {
            case "once":
                return true;
            case "periodically":
                // Can display even when advanced field is not on the form (i.e. advanced null/true)
                return advanced != "false" && tz == '';
            case "daily":
            case "day_and_month_in_year":
            case "weekly":
            case "monthly":
            case "day_week_month_year":
            case "week_in_month":
                // advanced field must be true AND on the form
                return advanced == "true" && tz == '';
            default:
                return false;
        }
    }

    // Given certain field values, determine whether to display entered_run_start
    function shouldShowEnteredRunStart() {
        // Continue if active is null (not on the form) or true
        if (active == "false")
            return false;

        switch (run) {
            case "once":
                return false;
            case "periodically":
                // Can display even when advanced field is not on the form (i.e. advanced null/true)
                return advanced != "false" && tz != '';
            case "daily":
            case "day_and_month_in_year":
            case "weekly":
            case "monthly":
            case "day_week_month_year":
            case "week_in_month":
                // advanced field must be true AND on the form
                return advanced == "true" && tz != '';
            default:
                return false;
        }
    }
}
