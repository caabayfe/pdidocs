var DiagramBuilderDiagramActionService = Class.create();

DiagramBuilderDiagramActionService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderDiagramActionService'
};

DiagramBuilderDiagramActionService._contstructDiagramActionData = function(diagramActionGr) {
    return {
        sysId: diagramActionGr.getUniqueValue(),
        key: gs.generateGUID(),
        name: diagramActionGr.getValue(DiagramBuilderDiagramAction.NAME),
        description: diagramActionGr.getValue(DiagramBuilderDiagramAction.DESCRIPTION),
        active: diagramActionGr.getValue(DiagramBuilderDiagramAction.ACTIVE),
        order: diagramActionGr.getValue(DiagramBuilderDiagramAction.ORDER),
        subCategory: diagramActionGr.getDisplayValue(DiagramBuilderDiagramAction.SUB_CATEGORY),
		categoryRef: diagramActionGr.getValue(DiagramBuilderDiagramAction.CATEGORY),
		subCategoryRef: diagramActionGr.getValue(DiagramBuilderDiagramAction.SUB_CATEGORY),
        category: diagramActionGr.getDisplayValue(DiagramBuilderDiagramAction.CATEGORY),
		categoryId: diagramActionGr.getValue(DiagramBuilderDiagramAction.CATEGORY),
        nodeType: diagramActionGr.getValue(DiagramBuilderDiagramAction.NODE_TYPE),
        configuration: diagramActionGr.getValue(DiagramBuilderDiagramAction.CONFIGURATION),
		icon: diagramActionGr.getValue(DiagramBuilderDiagramAction.ICON),
    };
};

DiagramBuilderDiagramActionService.getDiagramBuilderDiagramActionsByConfigId = function(configId) {
    var diagramActionsGr = DiagramBuilderDiagramAction.getDiagramActionsByConfigId(configId);
    var diagramActions = [];
    while (diagramActionsGr.next()) {
        diagramActions.push(DiagramBuilderDiagramActionService._contstructDiagramActionData(diagramActionsGr));
    }

    return diagramActions;
};

DiagramBuilderDiagramActionService.getDiagramBuilderDiagramActionsByCategoryId = function(configId, categoryId) {
    var diagramActionsGr = DiagramBuilderDiagramAction.getDiagramBuilderDiagramActionsByCategoryId(configId, categoryId);
    var diagramActions = [];
    while (diagramActionsGr.next()) {
        diagramActions.push(DiagramBuilderDiagramActionService._contstructDiagramActionData(diagramActionsGr));
    }

    return diagramActions;
};

DiagramBuilderDiagramActionService.getAllDiagramActionsForSearchTerm = function(configId, searchTerm) {
    var diagramActionsGr = DiagramBuilderDiagramAction.getAllDiagramActionsForSearchTerm(configId, searchTerm);
    var diagramActions = [];
    while (diagramActionsGr.next()) {
        diagramActions.push(DiagramBuilderDiagramActionService._contstructDiagramActionData(diagramActionsGr));
    }

    return diagramActions;
};

DiagramBuilderDiagramActionService.getDiagramBuilderDiagramActionById = function(diagramActionId) {
    var diagramActionGr = DiagramBuilderDiagramAction.getDiagramActionById(diagramActionId);
    return DiagramBuilderDiagramActionService._contstructDiagramActionData(diagramActionGr);
};
