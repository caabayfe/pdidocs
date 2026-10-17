var MLSolutionUtil = Class.create();
MLSolutionUtil.prototype = {
    initialize: function() {
    },

	/**
 	* getPredictions method is used to get ML predictions
 	* Input Parameters (injected into the method) are:
 	* 'input' - input can be GlideRecord or array of key-value pairs
 	* 'solutionNames' - array of names of solution against which prediction needs to be run
 	* Output - {JSON}
	* Output format - 
	* { 
	*   solution_name :  {
	*		input_gr_sys_id1/record_number: [
	*						{
	*						  predictedValue : ,
	*						  predictedSysId : ,
	*						  confidence : ,
	*						  threshold : 
	*						},    
	*						{
	*						  predictedValue : "",
	*						  predictedSysId : "",
	*						  confidence : "",
	*						  threshold : ""
	*						}
	*			]
	*		}
	*	}
 	*/
    getPredictions: function(input, solutionNames, options) {
		
    },

    type: 'MLSolutionUtil'
};
