var RunDiagramActions = Class.create();
RunDiagramActions.prototype = {
    initialize: function(actionId) {
        if (actionId) {
            this.actionRecord = new DiagramBuilderCanvasAction().getById(actionId);
        }
    },

    runAction: function(diagramJSON, instanceId) {
        var instance = new DiagramInstanceUtils(instanceId, diagramJSON);
        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable('instance', instance);
        if (this.actionRecord.isValid()) {
            var result = evaluator.evaluateScript(this.actionRecord, 'script', {
                x: {}
            });
            return DiagramBuilderCanvasActionService.getActionsByConfigId(
                this.actionRecord.getValue(DiagramBuilderCanvasAction.BUILDER_CONFIG), instanceId, diagramJSON);
        }
        return [];
    },

    type: 'RunDiagramActions'
};
