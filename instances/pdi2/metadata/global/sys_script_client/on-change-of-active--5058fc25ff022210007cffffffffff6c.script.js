function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    // active field must be present on the form to trigger this script

    if (isLoading || newValue === '')
        return;

    var run = g_form.getValue("run_type");
    var isActive = g_form.getValue("active") === "true";
    var types = ["daily", "day_and_month_in_year", "weekly", "monthly", "day_week_month_year", "week_in_month", "periodically"];
    var tz = g_form.getValue("time_zone");

    if (types.includes(run)) {
        // Manipulate advanced checkbox to control the display of all the advanced fields
        if (isActive) {
            g_form.setDisplay("advanced", true);
            g_form.setValue("advanced", hasAdvancedValues(run, tz) != '');
        } else {
            g_form.setDisplay("advanced", false);
            g_form.setValue("advanced", false);
        }
    } else if (run == "once")
        // Run once jobs only have one field to display
        g_form.setDisplay("run_start", isActive);

    // Edge case: Even when advanced checkbox is not present on the form, periodically jobs must display run_start
    // to maintain backwards compatibility. Active checkbox must control the display of this field too.
    if (run == "periodically" && !g_form.isVisible("advanced")) {
        g_form.setDisplay("run_start", isActive && !tz);
        g_form.setDisplay("entered_run_start", isActive && tz != '');
    }

    function hasAdvancedValues(run, tz) {
        var startField = tz ? "entered_run_start" : "run_start";
        var endField = tz ? "entered_run_end" : "run_end";

        switch (run) {
            case "daily":
            case "weekly":
            case "monthly":
            case "week_in_month":
                return (
                    g_form.getValue(startField) ||
                    g_form.getValue(endField) ||
                    g_form.getValue("repeat_every")
                );

            case "day_and_month_in_year":
            case "day_week_month_year":
            case "periodically":
                return (
                    g_form.getValue(startField) ||
                    g_form.getValue(endField)
                );

            default:
                return false;
        }
    }
}
