(function executeRule(current, previous /*null when async*/ ) {
    /*
	Purpose: Ensure backward compatibility by syncing the new field (run_daysofweek)
	with the old field (run_dayofweek) when only the old field is updated.
    This allows existing sys_trigger records using the old field to remain functional
    while transitioning to the new field, run_daysofweek. 
	*/



    var oldDayOfWeekField = 'run_dayofweek';
    var newDaySOfWeekField = 'run_daysofweek';

    // If the old field run_dayofweek changes and the new field run_daysofweek remains unchanged, sync the two fields
    if (current[oldDayOfWeekField].changes() && !current[newDaySOfWeekField].changes()) {
        // Copy the value from the old field to the new field
        current[newDaySOfWeekField] = convertDayToString(current[oldDayOfWeekField]);
    }

    // Helper: Convert integer to string representation
    function convertDayToString(dayValue) {
        return dayValue ? dayValue.toString() : '';
    }
})(current, previous);
