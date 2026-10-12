function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    var run = g_form.getValue("run_type");
    var active = g_form.getValue("active");
    var advanced = g_form.getValue("advanced");
    var tz = newValue;

    g_form.setDisplay("run_start", shouldShowRunStart());
    g_form.setDisplay("entered_run_start", shouldShowEnteredRunStart());

    if (oldValue == newValue)
        return;

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
