(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    /**
    Parameters:
    	applId (sys_id)
    */
    if (!request.queryParams.applId) {
        return;
    }

    var applId = request.queryParams.applId[0];
    if (!applId) {
        return;
    }

    var applGr = new GlideRecord('cmdb_ci_appl_generic');
    if (!applGr.get(applId)) {
        return;
    }

    var processData = {};
    processData.process_name = applGr.process_name + '';
    processData.running_process_command = applGr.running_process_command + '';
    return processData;

})(request, response);
