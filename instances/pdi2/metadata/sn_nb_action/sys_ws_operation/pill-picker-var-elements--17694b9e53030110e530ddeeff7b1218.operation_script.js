(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var tableName = decodeURIComponent(request.pathParams.table);
    var sysId = decodeURIComponent(request.pathParams.sys_id);
    var referenceTable = decodeURIComponent(request.pathParams.reference_table);

    var pillPickerUtils = new RAPillPickerUtils(tableName, sysId, referenceTable);
    var result;
    if (referenceTable.indexOf(Constants.VAR__M_SYS_HUB_FLOW_OUTPUT_PREFIX) > -1) {
        result = pillPickerUtils.getElements(Constants.pillPickerVars.INPUT_GENERATOR_OUTPUT_ELEMENTS);
    } else if (referenceTable == Constants.pillPickerVars.RESOURCE_GENERATOR_OUTPUT_IDENTIFIER_TABLE) {
        result = pillPickerUtils.getElements(Constants.pillPickerVars.RESOURCE_GENERATOR_OUTPUT_ELEMENTS);
    } else if (referenceTable.indexOf(Constants.VAR__M_SN_NB_ACTION_FIELD_RECOMMENDATION_INPUT_PREFIX) > -1) {
        result = pillPickerUtils.getElements(Constants.pillPickerVars.FIELD_RECOMMENDATION_INPUT_ELEMENTS);
    } else if(referenceTable.indexOf(Constants.VAR__M_SYS_SEARCH_RESULT_GENIUS_RESULT_FIELD_PREFIX)> -1){
        result = pillPickerUtils.getElements(Constants.pillPickerVars.GENIUS_RESULT_OUTPUT_ELEMENTS);
    } else if (referenceTable.indexOf(Constants.VAR__M_SN_NB_ACTION_CONTEXT_INPUT_PREFIX) > -1) {
        result = pillPickerUtils.getElements(Constants.pillPickerVars.CONTEXT_INPUT_ELEMENTS);
    }

    response.setBody(result);

})(request, response);
