(function process(request, response) {
    try {
        const setupId = request.pathParams.setup_id;
        const data = request.body.data;
        /*
            body_schema: 
			{
				'interaction_id': {
					type:string,
					source: 'interaction sys id'
				}
			}
		*/
        const restHandler = new SNHelpSetupRestHandler();
        const result = restHandler.contextHandler(setupId, data);
        const status = result && result.status;

        response.setStatus(status);

        if (status == 200)
            response.setBody(result);
        else
            response.setBody({
                error: result.message
            });

    } catch (ex) {
        response.setStatus(500);
        response.setBody({
            error: "Internal Server Error " + ex
        });
    }
})(request, response);
