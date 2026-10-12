function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === "3") {
        // trigger type = day of week
        g_form.setDisplay("run_daysofweek", true);
        g_form.setDisplay("run_dayofweek", true);
        handleDaysOfWeek();
    } else if (newValue === "5" || newValue === "7") {
        // trigger type = week in month or day in week in month in year
        g_form.setDisplay("run_dayofweek", true);
        g_form.setDisplay("run_daysofweek", false);
    } else {
        // all other trigger types
        g_form.setDisplay("run_dayofweek", false);
        g_form.setDisplay("run_daysofweek", false);
    }

    function handleDaysOfWeek() {
        var oldDayOfWeekField = 'run_dayofweek'; // Integer based field (1 = Monday, 2 = Tuesday etc.)
        var newDaySOfWeekField = 'run_daysofweek'; // String based field ("135" = Monday, Wednesday, Friday)
        var isNewDaySOfWeekFieldVisible = g_form.isVisible(newDaySOfWeekField);
        var oldDayOfWeekFieldValue = g_form.getValue(oldDayOfWeekField);
        var newDaySOfWeekFieldVal = g_form.getValue(newDaySOfWeekField);

        if (isNewDaySOfWeekFieldVisible) {
            // Hide run_dayofweek field
            g_form.setDisplay(oldDayOfWeekField, false);
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
}
