(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var payloads = request.body.data;
    var {
        table,
        sysId,
        message,
        context
    } = payloads;
    var logger = new sn_wwna.WWNALogger();

    logger.info("WWNA: Invoke WWNA action API request body arguments: " + JSON.stringify({
        table,
        sysId,
        message,
        context
    }));

    if (!table || !message || !context) {
        let missingParams = ['table', 'message', 'context'].filter(param => !payloads[param]);
        logger.error("WWNA: Invoke WWNA action API request body missing arguments: " + JSON.stringify(missingParams));
        response.setStatus(200);
        return response.setBody({
            status: 'success',
            data: {
                message: 'Missing required parameters: ' + missingParams.join(', '),
                isError: true
            }
        });
    }

    try {
        var wwna_table = "wwna_quick_actions";
        var result = new sn_wwna.WWNAUtils().invokeNACMAction(table, sysId, message, context);

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
        response.setStatus(200);
        return response.setBody({
            status: 'success',
            data: {

                message: "Something went wrong, please contact your system Admin!",
                isError: true
            }
        });
    }
})(request, response);
