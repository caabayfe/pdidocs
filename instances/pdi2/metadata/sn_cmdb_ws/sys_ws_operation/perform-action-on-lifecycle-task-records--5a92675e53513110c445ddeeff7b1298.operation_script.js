(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var input = request.body.data;

    var sysIds = input.sysIds;
    var taskToCiTable = input.taskToCiTable;
    var action = input.action;
    var userComment = input.userComment;
    var taskSysId = input.taskSysId;
    var allRecordsSelected = input.allRecordsSelected;
    var excludedSysIds = input.excludedSysIds;

    var cmdbWsDMTaskAccessor = new sn_cmdb_ws.CMDBWsDMTaskAccessor();

    if (!allRecordsSelected && (!sysIds || sysIds.length < 1)) {
        return cmdbWsDMTaskAccessor.ERROR_MESSAGES.INVALID_INPUT;
    }

    var availableActions = [cmdbWsDMTaskAccessor.ACTIONS.DM_EXCLUDE_RECORDS];

    if (availableActions.indexOf(action) == -1) {
        return cmdbWsDMTaskAccessor.ERROR_MESSAGES.INVALID_ACTION;
    }

    var result;
    if (action == cmdbWsDMTaskAccessor.ACTIONS.DM_EXCLUDE_RECORDS) {
        result = cmdbWsDMTaskAccessor.excludeRecords(taskSysId, taskToCiTable, sysIds, userComment, allRecordsSelected, excludedSysIds);
    }

    response.setBody(result);

})(request, response);
