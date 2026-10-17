var AutoResolutionPreProcessingExtPoint = Class.create();

AutoResolutionPreProcessingExtPoint.prototype = {
    
	STATUS_SUCCESS : global.AutoResolutionConstants.STATUS_SUCCESS, 
	STATUS_ERROR : global.AutoResolutionConstants.STATUS_ERROR,
	
	initialize: function() {
    },
	
	/**
	* Return the input fields that need to be used for LanguageX
	*
	* @param logger :  Auto-Resolution logger 
	* @param parameterBag : The following are the keys in the bag:  task_table_name, task_sys_id, ar_config_id
	*        eg: {
	*              task_table_name : 'hr_core_case',                   // The associated task table
	*		       task_sys_id : 'feda6b70072120109c3e59bf1ad30010',   // task sys Id 
	*              ar_config_id : 'a0ff3e68533101105400ddeeff7b12e8'.  // Auto-Resolution configuration sys Id
	*            }
	*
	* @returns {status: "success"/"error", message=" .. " , input_field:{ short_description:"xxx", description:"yyy"}, options:{}}
	*/
    process: function(logger, parameterBag) {
		
		logger.info("Starting auto-resolution pre-processing extension point: {0}", this.type);
        var response = { status: this.STATUS_SUCCESS, message: '', input_field:{}, options:{}};
		
		/* custom implementation goes here 
		
		var taskGr = AutoResolutionTaskDataBroker.getTaskRecord(parameterBag.task_table_name, parameterBag.task_sys_id);
		
		if (gs.nil(taskGr)) {
			response.status = this.STATUS_ERROR;  
			response.message = 'No data found'; // can be any error message when the status is error
			return response;
		}
		
		// Get the field names from the passed task table. These fields will be used for the LanguageX input
		var taskFieldNames = global.AutoResolutionUtil.getTaskTableFieldNamesForARPredictionInput(parameterBag.task_table_name);
		
		var fieldName;
		var fieldValue;
		
		for (var i=0; i<taskFieldNames.length; i++) {
			
			fieldName = taskFieldNames[i];
			fieldValue = taskGr.getValue(fieldName);
			
			if(!gs.nil(fieldValue))
				response.input_field[fieldName] = fieldValue;
		}

		// options are used to send additional input parameters in key-value pairs to the predict call 
		var options = {};
		options.mluc = AutoResolutionConstants.HR_USE_CASE_ID;
		options.top_n = 1;
		
		*/
		logger.info("Auto-resolution pre-processing extension point execution is completed: {0}", this.type);	
		return response;
    },

    type: 'AutoResolutionPreProcessingExtPoint'
};
