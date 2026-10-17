(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var input = request.body.data;

    var taskId = input.taskId;
    var selectProps = input.selectProps;
    var attributes = input.attributes;
    var action = input.action;
    var comment = input.comment;

    var proxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();
    var result = {};
    if (action === 'certify') {
        if (attributes && attributes.length) {
            result = proxy.certifyAttributes(taskId, attributes, comment, selectProps);
        } else {
            result = proxy.certifyRecords(taskId, selectProps);
        }
    } else if (action === 'fail') {
        if (attributes && attributes.length) {
            result = proxy.failAttributes(taskId, attributes, comment, selectProps);
        } else {
            result = proxy.failRecords(taskId, selectProps);
        }
    } else if (action === 'save_comment') {
        if (attributes && attributes.length) {
            result = proxy.saveAttributesComment(taskId, attributes, comment, selectProps);
        } else {
            result = proxy.saveRecordsComment(taskId, comment, selectProps);
        }
    }

    response.setBody({
        action: action,
        result: result
    });

})(request, response);
