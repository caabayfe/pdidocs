var DiagramBuilderUtils = Class.create();
DiagramBuilderUtils.prototype = {
    initialize: function() {},
    getArgumentsByActionId: function(actionId) {
        return DiagramActionArgumentsService.getArgumentsByActionId(actionId);
    },
    getArgumentsByActionIdsWithDirection: function(actionIds, direction) {
        var actionArguments = [];
        actionIds.forEach(function(actionId) {
            var argumentsData = DiagramActionArgumentsService.getArgumentsByActionIdWithDirection(actionId, direction);
            argumentsData.forEach(function(item) {
                actionArguments.push(item);
            });
        });

        return actionArguments;
    },
    getNodeTypeAttributes: function(nodeTypeIds) {
        var nodeTypeAttributes = [];
        nodeTypeIds.forEach(function(nodeTypeId) {
            var attributesData = DiagramBuilderNodeTypeAttributeService.getAttributesByNodeTypeId(nodeTypeId);
            attributesData.forEach(function(item) {
                nodeTypeAttributes.push(item);
            });
        });
        return nodeTypeAttributes;
    },

    type: 'DiagramBuilderUtils'
};
