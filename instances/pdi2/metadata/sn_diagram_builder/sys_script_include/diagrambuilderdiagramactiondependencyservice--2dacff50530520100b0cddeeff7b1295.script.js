var DiagramBuilderDiagramActionDependencyService = Class.create();
DiagramBuilderDiagramActionDependencyService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderDiagramActionDependencyService'
};

DiagramBuilderDiagramActionDependencyService.getActionDependencies = function(actionId) {
    var actionDependenciesGr = DiagramBuilderDiagramActionDependency.getActionDependencies(actionId);
    var actionDependencies = [];
    while (actionDependenciesGr.next()) {
        actionDependencies.push({
            action: DiagramBuilderDiagramActionApi.getDiagramActionDataById(actionDependenciesGr.getValue(DiagramBuilderDiagramActionDependency.ACTION_DEPENDENCY)),
            order: actionDependenciesGr.getValue(DiagramBuilderShapeTemplateMap.ORDER),
        });
    }
    return JSON.stringify(actionDependencies);
};
