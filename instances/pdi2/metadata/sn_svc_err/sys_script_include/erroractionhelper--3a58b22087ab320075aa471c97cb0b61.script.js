var ErrorActionHelper = Class.create();

// Error code task states
ErrorActionHelper.ERR_CODE_TASK_CLOSED_COMPLETE   = '3';
ErrorActionHelper.ERR_CODE_TASK_CLOSED_INCOMPLETE = '4';
ErrorActionHelper.ERR_CODE_TASK_CLOSED            = '7';

ErrorActionHelper.getErrorCodeObj = function(/*ScopedErrorCode*/ errCode) {
	if (!errCode)
		return {};
	
	var comment = errCode.getComment();
	//check if comment is undefined - happens when a task created and deleted but the status still remains assigned
	if ( comment == 'undefined'){
		comment = "";
	}
	
	var errCodeObj =  {
			statsSysId:          errCode.getStatsSysId(),
			id:                  errCode.getId(),
			name:                errCode.getName(),
			code:                errCode.getCode(),
			errorNumber:         errCode.getTotalErrors(),
			servicesImpacted:    errCode.getTotalAffectedItems(),
			impact:              errCode.getPriority(),
			trend:               errCode.getTrend(),
			description:         errCode.getDescription(),
			status:              errCode.getStatus(),
			comment:             comment,
			task:                this.getTaskForErrCode(errCode.getStatsSysId()),
			metadata:{
				os:                 {id: errCode.getOsId(), name: errCode.getOsName()},
				credential:         {id: errCode.getCredentialId(), name: errCode.getCredentialName()},
				pattern:            {id: errCode.getPatternId(), name: errCode.getPatternName()},
				cmdb_rule:          {id: errCode.getCmdbRuleId(), name: errCode.getCmdbRuleName()},
				executable_name:    {id: errCode.getExecutable(), name: errCode.getExecutable()}
			}
	};
	
	return errCodeObj;
};

ErrorActionHelper.getTaskForErrCode = function(statsSysId) {
	if (!statsSysId)
		return {};
		
	// Retrieve the latest task for this error code
	var errCodeTask = new GlideRecord("sa_error_handler_task");
	errCodeTask.addQuery('group_id', statsSysId);
	errCodeTask.orderByDesc('sys_updated_on');
	errCodeTask.query();

	if (!errCodeTask.next())
		return {};

	
	return {
		id:     errCodeTask.getUniqueValue(),
		label:  errCodeTask.getValue('number'),
		table:  errCodeTask.getTableName(),
		active: errCodeTask.getDisplayValue('active'),
		isComplete: errCodeTask.getValue('state') == ErrorActionHelper.ERR_CODE_TASK_CLOSED_COMPLETE
	};
};

// Check if there are any open tasks for the error code
ErrorActionHelper.hasTaskForErrCode = function(statsSysId) {
		var errCodeTask = this.getTaskForErrCode(statsSysId);
		
		if (errCodeTask && errCodeTask.hasOwnProperty("active") && errCodeTask.active === "true")
			return true;
		
		return false;
};

// Check if there are any open tasks for the error code
ErrorActionHelper.isTaskCompleteForErrCode = function(statsSysId) {
		var errCodeTask = this.getTaskForErrCode(statsSysId);
		
		if (errCodeTask && errCodeTask.hasOwnProperty("isComplete") && errCodeTask.isComplete)
			return true;
		
		return false;
};


ErrorActionHelper.getLastAggregationTime = function(applicationId) {
	/* eslint-disable no-undef */
	var time = new sn_svcerr.ErrorMgrScript(applicationId).getLastUpdatedTime();
	/* eslint-enable no-undef */
	var unit = gs.getMessage("seconds");
	if(time >= 60) {
		time = Math.floor((time+59)/60);
		unit = gs.getMessage("minutes");
	}
	return {
		value: time,
		unit: unit
	};
};


ErrorActionHelper.prototype = {
	
    initialize: function() {
    },
	
    type: 'ErrorActionHelper'
};
