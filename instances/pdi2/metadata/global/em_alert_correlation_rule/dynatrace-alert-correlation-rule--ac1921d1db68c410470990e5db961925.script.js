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
 (function findCorrelatedAlerts(currentAlert){
	var additional_info = currentAlert.getValue('additional_info');
	var additional_info_json = JSON.parse(additional_info);
	//gs.log("Dynatrace alert correlation " + additional_info); 
	var problem_id = additional_info_json['problem_id']; 
	var event_is_root_cause = additional_info_json['isRootCause']; 
	// Default 60 minutes between the first alert and the alerts that follow 
	var timeDifferenceInMinutes = 60; 
	// Initialization
	var result = {};
	// Get the alert that may be the parent of the current alert by answering the conditions. 
	// If the alert is primary - make the current alert secondary, else - do nothing.
	
	// Prepare time diff for the query
	var timeDifferenceBetweenAlerts = new GlideDateTime(currentAlert.getValue('initial_remote_time'));
	var timeDifferenceInMilliSeconds = Number(timeDifferenceInMinutes) * 1000 * 60;
	timeDifferenceBetweenAlerts.subtract(timeDifferenceInMilliSeconds);
	
	var gr = new GlideRecord('em_alert');
	//var problem_id = currentAlert.getValue('problem_id');
	gr.addQuery('additional_info', 'CONTAINS', problem_id);
	// Add query to search for alerts that are not closed by relation of potential parent (0 or 1) in time window (60) and order by time of creation
	//gr.addQuery('state', 'NOT IN', 'Closed');
	gr.addQuery('correlation_rule_group', 'IN', '0,1'); // 0 = None (potential parent) | 1 = Primary alert (parent) | 2 = Secondary
	gr.addQuery('initial_remote_time', '>=', timeDifferenceBetweenAlerts);
	gr.orderBy('initial_remote_time');
	
	gr.query();
	if (gr._next()) {
		if(event_is_root_cause === "true") {
			result = {
				'PRIMARY': [currentAlert.sys_id], 
				'SECONDARY': [gr.getUniqueValue()]
			};
		}
		else {
			result = {
				'PRIMARY': [gr.getUniqueValue()], 
				'SECONDARY': [currentAlert.sys_id] 
			};
		}
	}
	return JSON.stringify(result);
 })(currentAlert);
