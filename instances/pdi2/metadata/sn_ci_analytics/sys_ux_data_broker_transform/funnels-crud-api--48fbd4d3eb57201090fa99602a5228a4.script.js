function transform(input) {

    var payload = input.payload;
    if (!payload) {
        return;
    }

    var transformUtils = new VAConditionBuilderTransformationUtils();
    var conditionBuilderUtil = new VAConditionBuilderUtil();


    var output = {};

    var requestBody;
    var response;
    var minifiedJson;
    var newFunnelId;
    try {
        var funnelGr = new GlideRecord('sn_ci_analytics_funnel');
        if (payload.create && funnelGr.canCreate()) {
            requestBody = getAppseeRequestPayload(payload.create);
            response = AnalyticsServiceInvoker.invoke("Funnel", "createFunnel", requestBody);

            minifiedJson = getMinifiedComparison(payload.create.steps);
            newFunnelId = createRecord(response.FunnelId, requestBody.funnel_name, JSON.stringify(minifiedJson), minifiedJson.length);

        } else if (payload.update && funnelGr.canWrite()) {
            requestBody = getAppseeRequestPayload(payload.update);
            response = AnalyticsServiceInvoker.invoke("Funnel", "updateFunnel", requestBody);

            minifiedJson = getMinifiedComparison(payload.update.steps);
            newFunnelId = updateRecord(requestBody.funnel_id, response.FunnelId, requestBody.funnel_name, JSON.stringify(minifiedJson), minifiedJson.length);

        } else if (payload.remove && funnelGr.canDelete()) {
            var deleteFunnelId = payload.remove.funnelId;
            requestBody = {
                "funnel_id": getAppseeFunnelId(deleteFunnelId)
            };
            response = AnalyticsServiceInvoker.invoke("Funnel", "removeFunnel", requestBody);
            deleteRecord(deleteFunnelId);
        } else {
            return {
                status: 'INSUFFICIENT_PERMISSIONS',
                message: gs.getMessage('Insufficient permissions')
            };
        }
        output.status = 'SUCCESS';
        output.success = true;
        output.funnelId = newFunnelId;
    } catch (e) {
        try {
            var error = JSON.parse(JSON.stringify(e));
            var errorResponse = JSON.parse(error.response);
            output = {
                message: errorResponse.Error,
                success: false
            };
            //FIXME: Use the error codes from the error response rather than the message (after the error codes are implemented)
            if (errorResponse.Error.contains('existing name')) {
                output.status = 'DUPLICATE_NAME';
            } else {
                output.status = 'APPSEE_RESPONSE_ERROR';
                output.message = e.message;
            }
        } catch (parseError) {
            output.status = 'APPSEE_RESPONSE_ERROR';
            output.message = e.message;
        }
    }

    return output;

    // TODO: Do ACL checks for these operations

    function deleteRecord(sysId) {
        var gr = new GlideRecord('sn_ci_analytics_funnel');
        if (gr.get(sysId)) {
            gr.deleteRecord();
        }
    }

    function updateRecord(oldFunnelId, newFunnelId, name, designJson, totalSteps) {
        var gr = new GlideRecord('sn_ci_analytics_funnel');
        gr.addQuery('appsee_funnel_id', oldFunnelId);
        gr.query();
        if (gr.next()) {
            gr.setValue('appsee_funnel_id', newFunnelId);
            gr.setValue('name', name);
            gr.setValue('design_json', designJson);
            gr.setValue('total_steps', totalSteps);
            gr.update();

            return gr.getUniqueValue();
        }

        //Todo: Handle if record doesn't exist
    }

    function createRecord(funnelId, name, designJson, totalSteps) {
        var gr = new GlideRecord('sn_ci_analytics_funnel');
        gr.initialize();
        gr.setValue('appsee_funnel_id', funnelId);
        gr.setValue('name', name);
        gr.setValue('design_json', designJson);
        gr.setValue('total_steps', totalSteps);
        return gr.insert();
    }

    function getAppseeRequestPayload(input) {
        var steps = input.steps;
        var processedSteps = input.processedSteps;
        var funnelName = input.funnelName;

        var appseePayload = conditionBuilderUtil.convertToAppseeFunnel(processedSteps);
        if (!appseePayload.success)
            //TODO: Do something if transformation fails
            return;

        var body = {
            "steps": appseePayload.query,
            "platform": 3,
            "funnel_name": funnelName,
            "date_interval": 2
        };
        if (input.funnelId)
            body.funnel_id = getAppseeFunnelId(input.funnelId);

        return body;

    }

    function getMinifiedComparison(steps) {
        var min = [];
        steps.forEach(function(step) {
            min.push({
                comparisonModel: transformUtils.getMinifiedComparisonModel(step.comparisonModel),
                stepNo: step.stepNo
            });
        });
        return min;

    }

    function getAppseeFunnelId(sys_id) {
        var funnelGR = new GlideRecord('sn_ci_analytics_funnel');
        if (funnelGR.get(sys_id)) {
            return funnelGR.getValue('appsee_funnel_id');
        }
    }
}
