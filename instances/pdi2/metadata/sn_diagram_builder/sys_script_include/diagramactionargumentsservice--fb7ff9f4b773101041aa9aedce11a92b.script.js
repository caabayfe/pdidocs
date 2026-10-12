var DiagramActionArgumentsService = Class.create();
DiagramActionArgumentsService.prototype = {
    initialize: function() {},

    type: 'DiagramActionArgumentsService'
};

DiagramActionArgumentsService._contstructActionArgumentsData = function(argumentsGr) {
    return {
        argumentId: argumentsGr.getUniqueValue(),
        name: argumentsGr.getValue(DiagramActionArguments.NAME),
        active: argumentsGr.getValue(DiagramActionArguments.ACTIVE),
        order: argumentsGr.getValue(DiagramActionArguments.ORDER),
        defaultValue: argumentsGr.getDisplayValue(DiagramActionArguments.DEFAULT_VALUE),
        direction: argumentsGr.getValue(DiagramActionArguments.DIRECTION),
        mandatory: argumentsGr.getValue(DiagramActionArguments.MANDATORY) == 1,
        type: argumentsGr.getValue(DiagramActionArguments.TYPE),
        actionId: argumentsGr.getValue(DiagramActionArguments.DIAGRAM_ACTION),
        actionName: argumentsGr.getDisplayValue(DiagramActionArguments.DIAGRAM_ACTION),
        nodeType: argumentsGr[DiagramActionArguments.DIAGRAM_ACTION][DiagramBuilderDiagramAction.NODE_TYPE],
        label: argumentsGr.getValue(DiagramActionArguments.LABEL),
		description: argumentsGr.getValue(DiagramActionArguments.DESCRIPTION),
    };
};

DiagramActionArgumentsService.getArgumentsByActionId = function(actionId) {
    var actionArguments = [];
    var action = DiagramBuilderDiagramAction.getDiagramActionById(actionId);
    var fetchedArguments = DiagramActionArguments.getArgumentsByActionId(actionId);
    while (fetchedArguments.next()) {
        actionArguments.push(DiagramActionArgumentsService._contstructActionArgumentsData(fetchedArguments));
    }
    if (actionArguments.length == 0) {
        actionArguments.push({
            actionId: action.getValue('sys_id'),
            actionName: action.getValue('name')
        });
    }
    return actionArguments;
};

DiagramActionArgumentsService.getArgumentsByActionIdWithDirection = function(actionId, direction) {
    var actionArguments = [];
    gs.info("getActionArgumentsByIdWithDirection  Service  " + actionId);
    var action = DiagramBuilderDiagramAction.getDiagramActionById(actionId);
    var fetchedArguments = DiagramActionArguments.getArgumentsByActionIdWithDirection(actionId, direction);
    while (fetchedArguments.next()) {
        actionArguments.push(DiagramActionArgumentsService._contstructActionArgumentsData(fetchedArguments));
    }
    if (actionArguments.length == 0) {
        actionArguments.push({
            actionId: action.getValue('sys_id'),
            actionName: action.getValue('name'),
            nodeType: action.getValue(DiagramBuilderDiagramAction.NODE_TYPE),
        });
    }
    return actionArguments;
};
