function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    var run = newValue;
    var active = g_form.getValue("active");
    var advanced = g_form.getValue("advanced");
    var tz = g_form.getValue("time_zone");

    // This logic may execute even when active field is not present on the form (i.e. active null/true)
    if (active != "false") {
        if (run == "weekly") {
            // trigger type = day of week
            g_form.setDisplay("run_dayofweek", true);
            g_form.setDisplay("run_daysofweek", true);
            handleDaysOfWeek();
        } else if (run == "week_in_month" || run == "day_week_month_year") {
            // trigger type = week in month or day in week in month in year
            g_form.setDisplay("run_dayofweek", true);
            g_form.setDisplay("run_daysofweek", false);
        } else {
            // all other trigger types
            g_form.setDisplay("run_dayofweek", false);
            g_form.setDisplay("run_daysofweek", false);
            handleDaysOfWeek();
        }
    } else {
        g_form.setDisplay("run_dayofweek", false);
        g_form.setDisplay("run_daysofweek", false);
    }

    g_form.setDisplay("run_start", shouldShowRunStart());
    g_form.setDisplay("entered_run_start", shouldShowEnteredRunStart());

    setRunStartTime();

    function handleDaysOfWeek() {
        var oldDayOfWeekField = 'run_dayofweek'; // Integer based field (1 = Monday, 2 = Tuesday etc.)
        var newDaySOfWeekField = 'run_daysofweek'; // String based field ("135" = Monday, Wednesday, Friday)
        var isOldDayOfWeekFieldVisible = g_form.isVisible(oldDayOfWeekField);
        var isNewDaySOfWeekFieldVisible = g_form.isVisible(newDaySOfWeekField);
        var oldDayOfWeekFieldValue = g_form.getValue(oldDayOfWeekField);
        var newDaySOfWeekFieldVal = g_form.getValue(newDaySOfWeekField);

        if (isOldDayOfWeekFieldVisible && isNewDaySOfWeekFieldVisible && isEmpty(oldDayOfWeekFieldValue))
            g_form.setDisplay("run_dayofweek", false);

        if (isNewDaySOfWeekFieldVisible) {
            g_form.setDisplay("run_dayofweek", false);
            // If this is not a new record and run_daySofweek is empty
            if (!g_form.isNewRecord() && isEmpty(newDaySOfWeekFieldVal)) {
                // Set value for run_daySofweek field based on how it is getting rendered.
                var readOnlyDaysOfWeekElemId = 'sys_readonly.' + g_form.getTableName() + '.' + newDaySOfWeekField;
                var isRenderedAsReadOnly = document.getElementById(readOnlyDaysOfWeekElemId) !== null;
                if (isRenderedAsReadOnly)
                    g_form.setValue(newDaySOfWeekField, getTranslatedDayName(oldDayOfWeekFieldValue));
                else
                    g_form.setValue(newDaySOfWeekField, convertDayToString(oldDayOfWeekFieldValue));
            }
        }

        // Helper function to get translated day of week
        function getTranslatedDayName(dayNumber) {
            var dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            var dayKey = dayAbbreviations[dayNumber - 1];
            return dayKey ? getMessage(dayKey) : '';
        }

        // Helper function to convert integer day to string format
        function convertDayToString(oldValue) {
            return oldValue ? oldValue.toString() : '';
        }

        // Helper function to check if a value is empty
        function isEmpty(value) {
            return value == null || value === '';
        }
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

    function setRunStartTime() {
        // Only proceed if this is the specific record we want to update
        var currentID = g_form.getUniqueValue();
        if (currentID == '0c98a05b0fd233006e5140c1df767e19') {
            var runStartVal = g_form.getValue('run_start');

            // Check if the value contains "2019-10-01" (regardless of exact time/timezone)
            if (runStartVal && runStartVal.indexOf('2019-10-01') !== -1) {

                var now = new Date();

                // Format the date as yyyy-MM-dd HH:mm:ss
                var year = now.getFullYear();
                var month = (now.getMonth() + 1).toString().padStart(2, '0');
                var day = now.getDate().toString().padStart(2, '0');
                var hours = now.getHours().toString().padStart(2, '0');
                var minutes = now.getMinutes().toString().padStart(2, '0');
                var seconds = now.getSeconds().toString().padStart(2, '0');

                var formattedDate = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

                g_form.clearValue('run_start');
                // Set a small timeout to ensure the UI has time to process the clear
                setTimeout(function() {
                    g_form.setValue('run_start', formattedDate);
                    g_form.flash('run_start', '#FFFACD', 500);
                }, 50);
            }
        }
    }
}
