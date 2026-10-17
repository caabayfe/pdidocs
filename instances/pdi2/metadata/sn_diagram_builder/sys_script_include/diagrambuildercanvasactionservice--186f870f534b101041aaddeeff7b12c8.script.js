var DiagramBuilderCanvasActionService = Class.create();
DiagramBuilderCanvasActionService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderCanvasActionService'
};

DiagramBuilderCanvasActionService.getActionsByConfigId = function(configId, instanceId, diagramJSON) {
    var instance = new DiagramInstanceUtils(instanceId, diagramJSON);
    var evaluator = new GlideScopedEvaluator();
    evaluator.putVariable('instance', instance);
    var buildActionsGr = DiagramBuilderCanvasAction.getActionsByConfigId(configId);
    var buildActions = [];
    while (buildActionsGr.next()) {
        buildActions.push({
            id: buildActionsGr.getUniqueValue(),
            name: buildActionsGr.getValue(DiagramBuilderCanvasAction.NAME),
            componentTagName: buildActionsGr.getValue(DiagramBuilderCanvasAction.ACTION_TYPE) == 'action_component' ? buildActionsGr.getDisplayValue(DiagramBuilderCanvasAction.UI_COMPONENT) : "",
            enable: buildActionsGr.condition ? (evaluator.evaluateScript(buildActionsGr, 'condition', {
                x: {}
            })) : true,
			order:buildActionsGr.getValue(DiagramBuilderCanvasAction.ORDER)
        });
    }
    return buildActions;
};
