function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (!vaUtils.isValidDate(input.from_date) || !vaUtils.isValidDate(input.to_date)) {
        return {
            currentSteps: null,
            previousSteps: null
        };
    }
    //Convert string date in format YYYY-MM-DD to a date object
    var STEPS = 'Steps';

    var getRequestBody = function(fromDate, toDate, funnelId) {
        var requestBody = {};
        requestBody.from_date = fromDate;
        requestBody.to_date = toDate;
        requestBody.funnel_id = funnelId;

        return requestBody;
    };

    var fromDate = input.from_date;
    var toDate = input.to_date;
    var funnelId = input.funnel_id;

    var designJson = [];
    var appseeFunnelId;
    var funnelGR = new GlideRecord("sn_ci_analytics_funnel");
    if (!funnelGR.canRead()) {
        return {
            error: gs.getMessage('You do not have permission to view this funnel')
        };
    }
    if (funnelGR.get(funnelId)) {
        designJson = JSON.parse(funnelGR.design_json);
        appseeFunnelId = funnelGR.getValue('appsee_funnel_id');
    } else {
        return {
            error: gs.getMessage('The funnel you are looking for does not exist.')
        };
    }

    var requestBody = getRequestBody(fromDate, toDate, appseeFunnelId);
    var response = AnalyticsServiceInvoker.invoke("Funnel", "getSingleFunnel", requestBody);
    response = response || {};
    var currentSteps = response && response.Steps;

    var transformUtils = new VAConditionBuilderTransformationUtils();
    var output = {};
    try {
        currentSteps.forEach(function(step) {
            var stepNo = step.StepNumber;
            step.Alternatives.forEach(function(alternate, index) {
                alternate.display = {};
                var comparisonModel = designJson[stepNo - 1].comparisonModel;
                switch (alternate.StepType) {
                    case 'FirstSession': {
                        alternate.display.field = 'Conversation Start (1st)';
                        break;
                    }
                    case 'SessionStarted': {
                        alternate.display.field = 'Conversation Start (Any)';
                        break;
                    }
                    case 'EventTrigger': {
                        if (comparisonModel[index].field.indexOf('Topic') > -1) {
                            var fullComparison = transformUtils.getFullScaleComparisonModel(comparisonModel);
                            alternate.display.field = 'Topic';
                            alternate.display.value = fullComparison[index].conditionValue.display;
                        } else {
                            alternate.display.field = 'Event';
                            alternate.display.value = comparisonModel[index].conditionValue[0];
                            // Todo: Consider filter props also. Not needed for now
                        }
                        break;
                    }
                    case 'ScreenView': {
                        var fullComparison = transformUtils.getFullScaleComparisonModel(comparisonModel);

                        alternate.display.field = 'Node';
                        var topicName = fullComparison[index].conditionValue.display;
                        alternate.display.value = fullComparison[index].children[0].conditionValue.display + ' (Topic: ' + topicName + ')';
                    }
                }
            });
        });
    } catch (e) {
        output.error = JSON.stringify(e);
    }

    var previousPeriod = vaUtils.getPreviousPeriod(fromDate, toDate);
    requestBody.from_date = previousPeriod.fromDate;
    requestBody.to_date = previousPeriod.toDate;

    response = AnalyticsServiceInvoker.invoke("Funnel", "getSingleFunnel", requestBody);

    var previousSteps = response && response.Steps;

    output = {
        currentSteps: vaUtils.toCamel(currentSteps),
        previousSteps: vaUtils.toCamel(previousSteps),
        funnelName: response.Name,
        funnelStatus: response.Status
    };

    CIAnalyticsLogger.getLogger('ConversationSingleFunnel').debugJson('Data broker result - {}', output);
    return output;
}
