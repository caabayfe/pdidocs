(function executeRule(current, previous /*null when async*/) {

	var currRequests = current.getValue("max_request_allowed");
	var prevRequests = previous.getValue("max_request_allowed");

	// Check if the current requests exceed the previous requests 
	if(currRequests > prevRequests){
		var oneExtendViolationsGr = new GlideRecord('sys_one_extend_rate_limit_violations');
		oneExtendViolationsGr.addQuery('rate_limit_rule', current.sys_id);
		oneExtendViolationsGr.query();
		while(oneExtendViolationsGr.next()){
			// Deleting the violation records
			oneExtendViolationsGr.deleteRecord();
		}
	}
})(current, previous);
