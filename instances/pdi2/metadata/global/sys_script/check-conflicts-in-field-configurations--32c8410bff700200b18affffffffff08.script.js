(function executeRule(current, previous /*undefined when async or display*/) {
	function checkIntersection(what, checkIn) {
		var common = [];
		for (var i = 0; i < what.length; i++) {
			if (util.contains(checkIn, what[i])) {
				common.push(gr[what[i]].getLabel());
			}
		}
		return common;
	}
	var gr = new GlideRecord('change_request');
	gr.initialize();
	var util = new ArrayUtil();

	var mandatory = current.getValue('mandatory_fields').split(',');
	var fixed = current.getValue('restricted_fields').split(',');
	var toCopy = current.getValue('fields_to_copy').split(',');
	var defaultValues = current.getValue('default_values').split(',');
	var hasErr = false;

	var common = checkIntersection(fixed, mandatory);
	if (common.length > 0) {
		if (common.length == 1) {
			common = common[0];
		} else {
			common = common.join(', ');
		}
		gs.addErrorMessage(gs.getMessage("You cannot specify the same fields ({0}) in both Mandatory and Restricted fields.", common));
		hasErr = true;
	}

	common = checkIntersection(fixed, toCopy);
	if (common.length > 0) {
		if (common.length == 1) {
			common = common[0];
		} else {
			common = common.join(', ');
		}
		gs.addErrorMessage(gs.getMessage("You cannot specify the same fields ({0}) in both Restricted field and Fields to copy.", common));
		hasErr = true;
	}

	common = new StdChangeUtils().checkFieldsToCopyWithMandatory(mandatory, defaultValues, toCopy);
	if (common.length > 0) {
		gs.addErrorMessage(gs.getMessage("The combination of fields listed in <b>Default Change values</b> and <b>Change Fields to copy</b> must include all <b>Mandatory Change fields</b>.<br/>The missing fields are: {0}", common.join(", ")));
		hasErr = true;		
	}

	gr = new GlideRecord('change_task');
	gr.initialize();
	var taskMandatory = current.getValue('mandatory_task_fields').split(',');
	var taskFixed = current.getValue('restricted_task_fields').split(',');
	var taskToCopy = current.getValue('task_fields_to_copy').split(',');
	var defaultTaskValues = current.getValue('default_task_values').split(',');

	common = checkIntersection(taskFixed, taskMandatory);
	if (common.length > 0) {
		if (common.length == 1) {
			common = common[0];
		} else {
			common = common.join(', ');
		}
		gs.addErrorMessage(gs.getMessage("You cannot specify the same fields ({0}) in both Mandatory Change Task fields and Restricted Change Task fields.", common));
		hasErr = true;
	}

	common = checkIntersection(taskFixed, taskToCopy);
	if (common.length > 0) {
		if (common.length == 1) {
			common = common[0];
		} else {
			common = common.join(', ');
		}
		gs.addErrorMessage(gs.getMessage("You cannot specify the same fields ({0}) in both Restricted Change Task fields and Change Task Fields to copy.", common));
		hasErr = true;
	}

	common = new StdChangeTaskUtils().checkFieldsToCopyWithMandatory(taskMandatory, defaultTaskValues, taskToCopy);
	if (common.length > 0) {
		gs.addErrorMessage(gs.getMessage("The combination of fields listed in <b>Default Change Task values</b> and <b>Change Task Fields to copy</b> must include all <b>Mandatory Change Task fields</b>.<br/>The missing fields are: {0}", common.join(", ")));
		hasErr = true;		
	}
	
	if (hasErr)
		current.setAbortAction(true);

})(current, typeof previous != 'undefined' ?  previous : null);
