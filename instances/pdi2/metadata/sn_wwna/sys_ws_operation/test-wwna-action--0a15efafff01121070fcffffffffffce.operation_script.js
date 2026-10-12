(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var payloads = request.body.data;
    var {
        table,
        sysId,
        action,
        payload
    } = payloads;
    var logger = new sn_wwna.WWNALogger();
    logger.info("WWNA: Invoke WWNA action API request body arguments: " + JSON.stringify({
        table,
        sysId,
        action,
        payload
    }));
    if (!table || !sysId || !action || !payload) {
        let missingParams = ['table', 'sysId', 'action', 'payload'].filter(param => !payloads[param]);
        logger.error("WWNA: Invoke WWNA action API request body missing arguments: " + JSON.stringify(missingParams));
        response.setStatus(400);
        return response.setBody({
            status: 'failure',
            message: 'Missing required parameters: ' + missingParams.join(', ')
        });
    }
    try {
        const wwna_table = "wwna_quick_actions";
        const message = "/" + action + " " + payload;
        var result = new sn_wwna.WWNAUtils().invokeNACMAction(table, sysId, message, "public");
        if (result) {
            logger.info("WWNA: Skill Config API formatted skillConfiguration: " + JSON.stringify(result));
            response.setStatus(200);
            return response.setBody({
                status: 'success',
                data: result
            });
        } else {
            throw new Error("WWNA: Skill Config API error: Action result is empty");
        }
    } catch (error) {
        logger.error("WWNA: Invoke WWNA action API error: " + error.message);
        response.setStatus(500);
        return response.setBody({
            status: 'failure',
            message: "Something went wrong, please contact your system Admin!"
        });
    }
})(request, response);
