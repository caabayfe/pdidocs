(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payload = request.body.data;
    var result = {};
    var configUtil = new sn_oe_sfs.CollabConfigurationUtil();
	switch (payload.operation) {
        case 'INSERT_DELETE_RECORDS':
            result = configUtil.insertOrDeleteRecord(payload.channel, payload.items);
            break;
		case 'GROUP_FILTER':
            result = configUtil.applyGroupFilter(payload.channel, payload.items);
            break;
		case 'USER_FILTER':
            result = configUtil.applyUserFilter(payload.channel, payload.items);
            break;
	case 'DELETE_CONFIG':
             result = configUtil.deleteConfiguraton(payload.channel);
             break;
	}
    response.setContentType("application/json");
    response.setStatus(result.status);
    response.setBody(result.body);
})(request, response);
