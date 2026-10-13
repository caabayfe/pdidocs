/*
	NOTICE: THIS RULE IS NON-ACTIVE BY DEFAULT.
			YOU MUST ACTIVATE THE RULE IN ORDER TO WATCH IT WORK.
			
	The 2 following variables must be configured for this script to work. Alerts will be correlated by the values of these variables. See the "CONFIG:" header below for examples.
		1. exactMatchGroupingFields - List of fields in the alerts whose values have an exact match
		2. timeDifferenceInMinutes - Time difference between the creation (initial) time of primary alert to all following alerts
	All conditions must be met for the script to work.
	
	The returned result is an object with 2 keys:
		1. PRIMARY
		2. SECONDARY
	Where:
		1. Value for each key is an array of strings with existing, valid alert sys_id's
		2. PRIMARY has 1 sys_id
		3. SECONDARY can have from 1 to n sys_id's
	And:
		The actual result object is returned after passing through JSON.stringify(result)
	
	Example: 
	{'PRIMARY': ['f18b9ae673111300f1459361e5f6a7e3'], 'SECONDARY': ['3018dc7473111300f1459361e5f6a72c', 'c959d8f473111300f1459361e5f6a748']}
*/
(function findCorrelatedAlerts(currentAlert) {
    /* CONFIG: 
		 1. exactMatchGroupingFields
				 List of field names by which alerts are grouped if their values have an exact match 
				 Example: ['metric_name', 'severity', 'message_key'];
				 
		 2. timeDifferenceInMinutes
				 Time difference between alerts - in minutes. 
				 Example: 60 (equals 60 min, 1 hour)
	  */
    var exactMatchGroupingFields = ['metric_name'];
    var timeDifferenceInMinutes = 60; // Default 60 minutes between the first alert and the alerts that follow 
    /* End of configuration */

    // Initialization
    var result = {};

    // User input validation - Fields must exist in order to continue
    if (!exactMatchGroupingFields.length) {
        return result;
    }

    // Get the alert that may be the parent of the current alert by answering the conditions. 
    // If the alert is primary - make the current alert secondary, else - do nothing.

    // Prepare time diff for the query
    var fromTime = new GlideDateTime(currentAlert.getValue('initial_remote_time'));
    var toTime = new GlideDateTime(currentAlert.getValue('initial_remote_time'));
    var timeDifferenceInMilliSeconds = Number(timeDifferenceInMinutes) * 1000 * 60;
    fromTime.subtract(timeDifferenceInMilliSeconds);
    toTime.add(timeDifferenceInMilliSeconds);

    var gr = new GlideRecord('em_alert');
    // Add query to search alerts for matching values of predefined fields
    for (var i = 0; i < exactMatchGroupingFields.length; i++) {
        var field = exactMatchGroupingFields[i];
        gr.addQuery(field, currentAlert.getValue(field));
    }
    // Add query to search for alerts that are not closed by relation of potential parent (0 or 1) in time window (60) and order by time of creation
    // NOTE: anywhere that you want to read the sys_id of the currentAlert, you MUST use currentAlert.getUniqueValue(), because the alert might not have been inserted yet, 
    // in which case, the value of sys_id will be undefined.
    gr.addQuery('sys_id', '!=', currentAlert.getUniqueValue()); // ensure that we don't compare the alert to itself
    gr.addQuery('state', 'NOT IN', 'Closed');
    gr.addQuery('correlation_rule_group', 'IN', '0,1'); // 0 = None (potential parent) | 1 = Primary alert (parent) | 2 = Secondary
    gr.addQuery('initial_remote_time', '>=', fromTime);
    gr.addQuery('initial_remote_time', '<=', toTime);
	gr.addQuery('sys_domain', currentAlert.sys_domain); //The group must contain alerts within the same domain
    gr.orderBy('initial_remote_time');
    gr.orderBy('number'); // add a second "tie-breaker" order-by field so that in the event of initial_remote_time being in the same second, we will always take the earliest alert number.

    gr.query();
    if (gr._next()) {
        // Set the primary and secondary alerts by SysIds if parent was found 
        // The VALUES for BOTH keys (PRIMARY and SECONDARY) must be an ARRAY of ALERTS SYS_IDS, e.g. SECONDARY: [SYS_ID1, SYS_ID2...],
        // while the value for primary can contain only 1 sys_id
        // Compare current with gr to see which of the two should be the primary - must be consistent with above rules (order by initial_remote_time and number)
        var currentTime = new GlideDateTime(currentAlert.initial_remote_time).getNumericValue();
        var grTime = new GlideDateTime(gr.initial_remote_time).getNumericValue();
        var grIsPrimary = grTime < currentTime || (grTime == currentTime && gr.number < currentAlert.number);
        // NOTE: use getUniqueValue() for the result JSON, since sys_id is an object, not a string.
        result = {
            'PRIMARY': [grIsPrimary ? gr.getUniqueValue() : currentAlert.getUniqueValue()], // getUniqueValue() retrieves sys_id, then put in an array (value MUST be put in an array)
            'SECONDARY': [grIsPrimary ? currentAlert.getUniqueValue() : gr.getUniqueValue()] // Retrieve sys_id, then put in an array (value MUST be put in an array)
        };
    }
    return JSON.stringify(result);

})(currentAlert);
