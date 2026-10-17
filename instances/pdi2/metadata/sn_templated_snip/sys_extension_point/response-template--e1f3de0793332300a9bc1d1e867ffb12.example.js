var response_template = Class.create();
response_template.prototype = {
    initialize: function() {
    },
	
	/* return true if this extension point is to be run */
    shouldRun: function(options) {
	},
	
	/**
	 * @param tableName
	 * @param recordId
	 * @param searchTerm
	 * @param limit
	 * @param offset
	 * @param includeEvaluatedBody
	 * @param errorFormat [ex:"<span style='color:#ff0000'>${%s}</span>"]
	 * @param opts [optional parameteres that can be passed to extension point's should run]
	 * @return all the templates that can be applied to a given record
	 * [
	 *  {
	 *    "sys_id": string,
	 *    "name": string,
     *    "short_name": string,
     *    "body": html body,
     *    "short_name_match": true if exact match on short_name,
     *    "evaluated_response": {
	 *	 						"success": boolean,
	 *	 						"evaluated_body": evaluated html body,
	 *	 						"error": {
	 *      								"inAccessibleVariables": string,
	 *	 	 								"unEvaluatedVariables": string,
	 *	 	 								"message": error message
	 *	 						}
	 * 	  					}
	 *  }
	 * ]
	 */
	query: function(tableName, recordId, searchTerm, limit, offset, includeEvaluatedBody, errorFormat, opts) {
		return {};
	},
	
	/**
	 * @param templateId
	 * @param tableName
	 * @param recordId
     * @param opts [optional parameteres that can be passed to extension point's should run]
	 * @return all the templates that can be applied to a given record
	 */
	render: function(templateId, tableName, recordId, errorFormat, opts) {
		return {};
	},

    type: 'response_template'
};
