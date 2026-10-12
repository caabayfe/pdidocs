function process(record) {
	/**
	 * This OOTB scripted processor is read-only. If you need to customize the behavior of this
	 * processor, you need to create your own scripted processor by copying this script and
	 * making yuor changes there. Then you can link your own script to your search application
	 * configuration.
	 */ 
	
    var transformableTables = ['kb_knowledge'];
    var transformableDateFields = ['sys_updated_on'];
	
	var table = record.getTable();
	
	// It is a good practice to early terminate if possible, to avoid unnecessary overhead.
    if (transformableTables.indexOf(table) === -1)
		return;

    function transformToHumanFriendlyDate(rawDate) {
        // Time gaps in ms
        var MINUTE_GAP = 60000;
        var HOUR_GAP = 3600000;
        var DAY_GAP = 86400000;
        var WEEK_GAP = 604800000;
        var MONTH_GAP = 2592000000;
        var YEAR_GAP = 31536000000;

        var gap = new Date().getTime() - rawDate;
        if (gap < MINUTE_GAP) {
            return gs.getMessage('Just Now');
        } else if (gap > MINUTE_GAP && gap < 2 * MINUTE_GAP) {
            return gs.getMessage('1 minute ago');
        } else if (gap < HOUR_GAP) {
            return gs.getMessage('{0} minutes ago', '' + Math.floor(gap / MINUTE_GAP));
        } else if (gap > HOUR_GAP && gap < 2 * HOUR_GAP) {
            return gs.getMessage('1 hour ago');
        } else if (gap < DAY_GAP) {
            return gs.getMessage('{0} hours ago', '' + Math.floor(gap / HOUR_GAP));
        } else if (gap > DAY_GAP && gap < 2 * DAY_GAP) {
            return gs.getMessage('1 day ago');
        } else if (gap < WEEK_GAP) {
            return gs.getMessage('{0} days ago', '' + Math.floor(gap / DAY_GAP));
        } else if (gap > WEEK_GAP && gap < 2 * WEEK_GAP) {
            return gs.getMessage('1 week ago');
        } else if (gap < MONTH_GAP) {
            return gs.getMessage('{0} weeks ago', '' + Math.floor(gap / WEEK_GAP));
        } else if (gap > MONTH_GAP && gap < 2 * MONTH_GAP) {
            return gs.getMessage('1 month ago');
        } else if (gap < YEAR_GAP) {
            return gs.getMessage('{0} months ago', '' + Math.floor(gap / MONTH_GAP));
        } else if (gap > YEAR_GAP && gap < 2 * YEAR_GAP) {
            return gs.getMessage('1 year ago');
        } else {
            return gs.getMessage('{0} years ago', '' + Math.floor(gap / YEAR_GAP));
        }
    }

	for (var i = 0; i < transformableDateFields.length; i++) {
		var fieldName = transformableDateFields[i];
		var updatedDateField = record.getField(fieldName);
		if (updatedDateField !== null) {
			var updatedDateRaw = updatedDateField.getValue();
			if (updatedDateRaw != null) {
				var humanFriendlyDate = transformToHumanFriendlyDate(updatedDateRaw);
				updatedDateField.setDisplayValue(humanFriendlyDate);
			}
		}
	}
}
