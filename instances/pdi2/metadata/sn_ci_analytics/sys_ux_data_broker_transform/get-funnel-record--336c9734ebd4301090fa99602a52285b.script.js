function transform(input) {
    var output = {};

    var funnelId = input.payload;
    if (!funnelId)
        return null;

    var gr = new GlideRecord('sn_ci_analytics_funnel');
    if (!gr.canRead()) {
        output.error = gs.getMessage('Insufficient permissions');
    } else if (gr.get(funnelId)) {
        var data = gr.getValue('design_json');
        var steps = [];
        try {
            steps = getFullModel(JSON.parse(data));
            output.steps = steps;
            output.name = gr.getValue('name');
            output.success = true;
        } catch (e) {
            var message = JSON.stringify(e);
            output.success = false;
            output.error = message;
        }
    } else {
        output.error = gs.getMessage('Invalid funnel ID');
    }

    return output;

    function getFullModel(steps) {
        var transformUtils = new VAConditionBuilderTransformationUtils();
        var min = [];
        steps.forEach(function(step) {
            min.push({
                comparisonModel: transformUtils.getFullScaleComparisonModel(step.comparisonModel),
                stepNo: step.stepNo
            });
        });

        return min;
    }
}
