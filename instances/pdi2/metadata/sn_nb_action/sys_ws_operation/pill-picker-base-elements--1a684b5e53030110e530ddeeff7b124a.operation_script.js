(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var tableName = decodeURIComponent(request.pathParams.table);
    var sysId = decodeURIComponent(request.pathParams.sys_id);

    if (tableName == Constants.TBL_DECISION_TREE_NODE) {
        response.setBody(null);
    } else {
        var pillPickerUtils = new RAPillPickerUtils(tableName, sysId);
        var result = pillPickerUtils.getElements(Constants.pillPickerVars.BASE_ELEMENTS);
        response.setBody(result);
    }

})(request, response);
