var AutoResolutionPostProcessingExtPoint = Class.create();

AutoResolutionPostProcessingExtPoint.prototype = {
	
	STATUS_SUCCESS : global.AutoResolutionConstants.STATUS_SUCCESS, 
	STATUS_ERROR : global.AutoResolutionConstants.STATUS_ERROR,

    // criticality states
	CRITICALITY_NON_CRITICAL: global.AutoResolutionConstants.CRITICALITY_NON_CRITICAL,
	CRITICALITY_CRITICAL: global.AutoResolutionConstants.CRITICALITY_CRITICAL,
	CRITICALITY_INCONCLUSIVE: global.AutoResolutionConstants.CRITICALITY_INCONCLUSIVE,
	
    initialize: function() {
    },

    /**
    *  Return the normalized prediction results to update the prediction table - sys_cs_auto_resolution_prediction
    * 
    * @param logger 
    * @param parameterBag : The keys in the bag:  language_x_result, ar_config_id
    *       
    *        eg: {
    *				"language_x_result" : <object>,                   	// the result from the languageX. see below.
    *		 	    "ar_config_id" : "a0ff3e68533101105400ddeeff7b12e8" // Auto resolution configuration sys Id
    *            }
    *
    *		 where language_x_result object looks like this - 
    *
    *			{
    *				"schemaVersion": "1.0",
    *               "status": {
    *                   "code": 200,
    *                   "message": "SUCCESS"
    *               },
    *               "result": [
    *                   {
    *                       "input": {
    *                           "id": "feda6b70072120109c3e59bf1ad30010",
    *                           "tableName": "hr_core_case",
    *                            "fields": {
    *                                "description": "I have received incorrect salary amount"
    *                            }
    *                        },
    *                        "output": [
    *                           {
    *                               "service": "languageDetection",
    *                               "serviceOutput": "en",
    *                               "serviceOutputScore": 0.9963439,
    *                               "serviceOutputDetails": ""
    *                           },
    *    						{
    *      							"service": "criticalityDetection",
    *      							"serviceOutput": "PayContributions-Critical",
    * 								"serviceOutputScore": 0.94924694,
    *     							"serviceOutputDetails": "{\"status\":\"success\",\"response\":{\"utterance\":\"I have received incorrect salary amount\",\"intents\":[{\"intentName\":\"PayContributions-Critical\",\"nluModelName\":\"ml_x_snc_global_global_087ad49d1b9eb0101115da01b24bcb70\",\"score\":0.94924694,\"intents\":[]}],\"properties\":{\"inference.time\":\"12\",\"nluPlatformLanguage\":\"en\",\"nluPlatformVersion\":\"3.1.2-HYB\"}}}"
    *    						},
    *							{
    *    							"service": "searchQueryGeneration",
    *     							"serviceOutput": "",
    *      							"serviceOutputScore": "",
    *      							"serviceOutputDetails": "[{\"query\":\"incorrect salary\",\"score\":\"0.83\"},{\"query\":\"salary amount\",\"score\":\"0.73\"}]"
    *    						}
    *  						]
    *					}
    *				]
    *			}
    *
    * @returns : JSON object that contains field name-value pairs to update the prediction table - sys_cs_auto_resolution_prediction 
    *            the name in the result should be the same as the field name in the table
    *			
    *       eg: { 
    *             status: this.SUCCESS,  
    *			  message: ''
    *             result: [  // the block that contains name-value pairs
    *                         {
    *                              predicted_criticality: this.CRITICALITY_NON_CRITICAL , this.CRITICALITY_CRITICAL or this.CRITICALITY_INCONCLUSIVE
    *                         }
    *                     ]  
    *           }
    */
    process: function(logger, parameterBag) {
		
		logger.info("Starting post-processing extension: {0}", this.type);
		
		var response = {status:this.STATUS_SUCCESS, message:'', result: []};
		
		/* custom implementation goes here 
		- example:
		
		response.result =  [{
								predicted_criticality: this.CRITICALITY_NON_CRITICAL // normalized value from the value from parameterBag.language_x_result.result.output[0].service == 'criticalityDetection'
						   }];
		*/
		logger.info("The execution of post-processing extension is completed: {0}", this.type);
		return response;
    },

    type: 'AutoResolutionPostProcessingExtPoint'
};
