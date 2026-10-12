function onLoad() {
    var run = g_form.getValue("run_type");
    // This script may run even when active field is not present on the form (i.e. active null/true)
    var isActive = g_form.getValue("active") != "false";
    var tz = g_form.getValue("time_zone");
    var types = ["daily", "day_and_month_in_year", "weekly", "monthly", "day_week_month_year", "week_in_month"];

    if (types.includes(run)) {
        if (isActive) {
            if (hasAdvancedValues(run, tz)) {
                if (!g_form.isNewRecord())
                    g_form.setValue("advanced", true);
            }
        }
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
                return (
                    g_form.getValue(startField) ||
                    g_form.getValue(endField)
                );

            default:
                return false;
        }
    }
}
