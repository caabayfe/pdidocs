(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

/*
*
* @param tableName
* @param recordId - sys_id
* @param searchTerm 
* @param limit - integer value
* @param offset - integer value
* @param includeEvaluatedBody - true/false value
* @param errorFormat [ex:"<span style='color:#ff0000'>${%s}</span>"]
* @param opts [optional parameters that can be passed to extension point's should run] - object with key values
*        ex. {
*              channel: channel sys_id
*            }
*
* @return JSON string - array of all the templates that can be applied to a given record
* Example:
* [
*  {
*    "sys_id": string,
*    "name": string,
*    "short_name": string,
*    "body": html body,
*    "short_name_match": true if exact match on short_name,
*    "evaluated_response": {
*	 					    "success": boolean,
*	 						"evaluated_body": evaluated html body,
*	 						"error": {
*      								"inAccessibleVariables": string,
*	 	 								"unEvaluatedVariables": string,
*	 	 								"message": error message
*	 						}
* 	  					   }
*  }
* ]
*/
	var tableName            = request.body.data.tableName;
	var recordId             = request.body.data.recordId;
	var searchTerm           = request.body.data.searchTerm;
	var limit                = request.body.data.limit;
	var offset               = request.body.data.offset;
	var includeEvaluatedBody = request.body.data.includeEvaluatedBody;
	var errorFormat          = request.body.data.errorFormat;
	var opts                 = request.body.data.opts;
	
	return new sn_templated_snip.ResponseTemplate()
		.query(tableName, recordId, searchTerm, limit, offset, includeEvaluatedBody, errorFormat, opts);

})(request, response);
