(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var TABLE_NAME = 'sn_experiment_core_experiment';

    try {
        var requestData = request.body.data;
        if (!requestData) {
            response.setStatus(400);
            response.setBody({ error: 'Missing request body' });
            return;
        }

        var experimentSysId = requestData.experimentSysId;
        var optOut = requestData.optOut;

        if (!experimentSysId) {
            response.setStatus(400);
            response.setBody({ error: 'Missing required parameter: experimentSysId' });
            return;
        }

        if (optOut === undefined || optOut === null) {
            response.setStatus(400);
            response.setBody({ error: 'Missing required parameter: optOut' });
            return;
        }

        var gr = new GlideRecord(TABLE_NAME);
        if (!gr.get(experimentSysId)) {
            response.setStatus(404);
            response.setBody({ error: 'Experiment not found for sys_id: ' + experimentSysId });
            return;
        }

        // Validate experiment is a feature_flag category
        if (gr.getValue('category') !== 'feature_flag') {
            response.setStatus(400);
            response.setBody({ error: 'Only feature flag experiments can be toggled via this API' });
            return;
        }

        var optOutValue = (optOut === true || optOut === 'true') ? true : false;
        gr.setValue('opt_out', optOutValue);

        if (!gr.update()) {
            gs.error('[ToggleOptOut API] Failed to update experiment: ' + experimentSysId);
            response.setStatus(500);
            response.setBody({ error: 'Failed to update experiment opt_out field' });
            return;
        }

        response.setStatus(200);
        response.setBody({
            result: {
                experimentSysId: experimentSysId,
                opt_out: gr.getValue('opt_out'),
                status: gr.getValue('status'),
                name: gr.getValue('name')
            }
        });

    } catch (e) {
        gs.error('[ToggleOptOut API] Uncaught error: ' + e.message);
        response.setStatus(500);
        response.setBody({ error: 'Internal server error: ' + e.message });
    }

})(request, response);
