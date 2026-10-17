(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var triggerField = '' + request.pathParams.sys_id;

	if (!triggerField)
		throw new sn_ws_err.BadRequestError("Trigger field empty");

	var triggerQuestion = GlideappQuestion.getQuestion(triggerField);
	if (triggerQuestion == null)
		throw new sn_ws_err.BadRequestError("Trigger question empty");

	if (triggerQuestion.getType() !== 8 && triggerQuestion.getType() !== 31)
		throw new sn_ws_err.BadRequestError("Trigger question not of type reference/requested for");

	var dynamicTableName = triggerQuestion.getReference();

    var request_body = request.body.nextEntry();
    var recordId = '' + request_body.sysparm_dynamic_record_id;
    var targetFields = '' + request_body.sysparm_dynamic_target_fields;

    var result = {};

    var targetFieldsArr;
    if (targetFields)
		targetFieldsArr = targetFields.split(',');

    for (var i = 0; i < targetFieldsArr.length; i++) {
        try {
            var question = GlideappQuestion.getQuestion(targetFieldsArr[i]);
            if (question) {
                var dynamicDotWalkPath = question.getDynamicValueDotWalkPath();
                if (dynamicTableName && dynamicDotWalkPath) {

                    var gr = new GlideRecord(dynamicTableName);
                    var isPresent = gr.get(recordId);

                    var fieldName = question.getName();
                    result[fieldName] = {};

                    if (isPresent && gr.canRead()) {
						var ge = gr.getElement(dynamicDotWalkPath);
						if (!ge.canRead()) {
							gs.error(gs.getUserName() + ' does not have read access to ' + dynamicDotWalkPath + ' on ' + dynamicTableName);
							result[fieldName].value = '';
							result[fieldName].displayValue = '';
						} else {
							var questionType = question.getType(); // checking for date/datetime variable type
							result[fieldName].value = ((questionType == 9 || questionType == 10) ? ge.getDisplayValue() : ge) + '';
							var parts = dynamicDotWalkPath.split('.');
							var pathEndsWithSysId = parts[parts.length - 1] === 'sys_id';
							if (!pathEndsWithSysId) //If sys_id is being set, do not send displayValue sothat it will auto-resolve.
								result[fieldName].displayValue = '' + ge.getDisplayValue();

						}
                    } else {
                    		gs.error('Record does not exist or record access issue');
							result[fieldName].value = '';
							result[fieldName].displayValue = '';
                    }
                }
            }
        } catch (e) {
            gs.debug(e);
        }
    }

    return result;
})(request, response);
