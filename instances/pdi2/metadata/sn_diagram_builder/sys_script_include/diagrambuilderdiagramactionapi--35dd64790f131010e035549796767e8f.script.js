var DiagramBuilderDiagramActionApi = Class.create();
DiagramBuilderDiagramActionApi.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderDiagramActionApi'
};

DiagramBuilderDiagramActionApi._getBindingsValueArray = function(properties, overrides) {
    var bindings = {};

    properties.forEach(function(property) {
        var target = property.targetProperty;
        var source = target + '_' + property.sysId;

        if (!gs.nil(property.sourceProperty))
            source = property.sourceProperty;

        var binding = {
            source: source,
            property: {
                target: target,
                value: property.defaultValue,
                sysId: property.sysId,
                isAdvanced: property.isAdvanced
            }
        };

        bindings[target] = binding;
    });

    overrides.forEach(function(override) {
        var shapeProperty = DiagramBuilderShapePropertyService.getPropertyById(override.shapeProperty);
        var target = shapeProperty.targetProperty;
        var source = target + '_' + override.shapeTemplateMap + '_' + shapeProperty.sysId;

        if (!gs.nil(shapeProperty.sourceProperty))
            source = shapeProperty.sourceProperty;

        if (!gs.nil(override.overriddenSourceProperty))
            source = override.overriddenSourceProperty;

        var binding = {
            property: {
                target: target,
                value: shapeProperty.defaultValue,
                overriddenValue: override.overriddenValue,
                sysId: shapeProperty.sysId,
                isAdvanced: shapeProperty.isAdvanced,
                overriddenFunction: override.overriddenFunction
            },
            source: source,
        };

        bindings[target] = binding;
    });

    var bindingsArray = [];

    for (var binding in bindings) {
        if (bindings.hasOwnProperty(binding)) {
            bindingsArray.push(bindings[binding]);
        }
    }

    return bindingsArray;
};

DiagramBuilderDiagramActionApi._getIcon = function(diagramAction, nodeType) {
    if (!gs.nil(diagramAction.icon)) return diagramAction.icon;
    if (!gs.nil(nodeType.icon)) return nodeType.icon;

    var category = DiagramBuilderCategoryService.getCategoryById(diagramAction.subCategoryRef);
    if (!gs.nil(category.icon)) return category.icon;

    return "/action-node.svg";
};

DiagramBuilderDiagramActionApi.getAllDiagramActionsForCategory = function(configId, categoryId) {
    var diagramActions = DiagramBuilderDiagramActionService.getDiagramBuilderDiagramActionsByCategoryId(configId, categoryId);
    var diagramActionsDataArray = [];
    diagramActions.forEach(function(diagramAction) {
        diagramActionsDataArray.push(DiagramBuilderDiagramActionApi._constructDiagramActionData(diagramAction));
    });

    return diagramActionsDataArray;
};

DiagramBuilderDiagramActionApi.getAllDiagramActionsForSearchTerm = function(configId, searchTerm) {
    var diagramActions = DiagramBuilderDiagramActionService.getAllDiagramActionsForSearchTerm(configId, searchTerm);
    var diagramActionsDataArray = [];
    diagramActions.forEach(function(diagramAction) {
        diagramActionsDataArray.push(DiagramBuilderDiagramActionApi._constructDiagramActionData(diagramAction));
    });

    return diagramActionsDataArray;
};

DiagramBuilderDiagramActionApi._getShapeTemplatePropertiesById = function(shapeTemplateId, propertyOverrides) {
    var properties = DiagramBuilderShapePropertyService.getPropertiesByShapeTemplateId(shapeTemplateId);
    var templateChildMaps = DiagramBuilderShapeTemplateMapService.getChildTemplateMapsByShapeTemplateId(shapeTemplateId);
    var bindingsDataArray = [];

    bindingsDataArray = DiagramBuilderDiagramActionApi._getBindingsValueArray(properties, propertyOverrides);

    templateChildMaps.forEach(function(map) {
        var overrides = DiagramBuilderShapePropertyOverrideService.getPropertyOverrideByTemplateMapId(map.sysId) || [];
        [].push.apply(bindingsDataArray, DiagramBuilderDiagramActionApi._getShapeTemplatePropertiesById(map.shapeTemplate, overrides));
    });

    return bindingsDataArray;
};

DiagramBuilderDiagramActionApi.getDiagramActionDataById = function(diagramActionId, includeDependencies) {
    var diagramAction = DiagramBuilderDiagramActionService.getDiagramBuilderDiagramActionById(diagramActionId);
    return DiagramBuilderDiagramActionApi._constructDiagramActionData(diagramAction, includeDependencies);
};

DiagramBuilderDiagramActionApi._constructDiagramActionData = function(diagramAction, includeDependencies) {
    includeDependencies = includeDependencies === null || includeDependencies === undefined ? true : includeDependencies;
    var nodeType = DiagramBuilderNodeTypeService.getNodeTypeById(diagramAction.nodeType);
    // Flatten node type's attributes and connectors at action level, so that in future if there is need to override them,
    // at action level API response remains unmodified and extensible.
    var attributes = DiagramBuilderNodeTypeAttributeService.getAttributesByNodeTypeId(diagramAction.nodeType);
    var connectors = DiagramBuilderNodeConnectorService.getNodeConnectorsByType(diagramAction.nodeType);
    var diagramActionData = {
        name: diagramAction.name,
        key: diagramAction.key,
        sysId: diagramAction.sysId,
        description: diagramAction.description,
        icon: DiagramBuilderDiagramActionApi._getIcon(diagramAction, nodeType),
        category: diagramAction.category,
        categoryId: diagramAction.categoryId,
        subCategory: diagramAction.subCategory,
        order: diagramAction.order,
        nodeType: nodeType,
        attributes: attributes,
        connectors: connectors
    };
    var actionDependencies = DiagramBuilderDiagramActionDependencyService.getActionDependencies(diagramAction.sysId);
    diagramActionData.actionDependencies = actionDependencies;
    return diagramActionData;
};

DiagramBuilderDiagramActionApi.getDiagramActionsDataArray = function(diagramActionIds) {
    var diagramActionsDataArray = [];
    diagramActionIds.forEach(function(diagramActionId) {
        var diagramActionData = DiagramBuilderDiagramActionApi.getDiagramActionDataById(diagramActionId);
        diagramActionsDataArray.push(diagramActionData);
    });

    return diagramActionsDataArray;
};

DiagramBuilderDiagramActionApi.buildShapeTemplateJsonForAction = function(action, configId) {
    var shapeTemplateId = action.nodeType.shapeTemplate;
    var shapeTemplateJson = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(shapeTemplateId, [], {}, configId);
    // Add connectors for this action, which will update shapeTemplateJson with appropriate ports.
    DiagramBuilderDiagramActionApi.addActionConnectors(action.connectors, shapeTemplateJson);
    return shapeTemplateJson;
};

DiagramBuilderDiagramActionApi.getShapeTemplateByActionId = function(actionId) {
    var actionPropertyMap = {};
    var nodeTypeShapeTemplateMap = {};
    var action = DiagramBuilderDiagramActionApi.getDiagramActionDataById(actionId, false);
    actionPropertyMap[actionId] = action;
    var nodeTypeId = action.nodeType.sysId;
    nodeTypeShapeTemplateMap[nodeTypeId] = DiagramBuilderDiagramActionApi.buildShapeTemplateJsonForAction(action);
    return {
        actionPropertyMap: actionPropertyMap,
        nodeTypeShapeTemplateMap: nodeTypeShapeTemplateMap
    };
};

DiagramBuilderDiagramActionApi.getShapeTemplatesByActionIds = function(actionIds, configId) {
    var actionPropertyMap = {};
    var nodeTypeShapeTemplateMap = {};
    actionIds.forEach(function(actionId) {
        // Consider unique actions only
        if (!actionPropertyMap.actionId) {
            var action = DiagramBuilderDiagramActionApi.getDiagramActionDataById(actionId, false);
            actionPropertyMap[actionId] = action;
            var nodeTypeId = action.nodeType.sysId;
            var shapeTemplateId = action.nodeType.shapeTemplate;
            // Ensure that we pull only unique shape templates for each unique nodeType
            if (!nodeTypeShapeTemplateMap[nodeTypeId])
                nodeTypeShapeTemplateMap[nodeTypeId] = DiagramBuilderDiagramActionApi.buildShapeTemplateJsonForAction(action, configId);
        }
    });

    return {
        actionPropertyMap: actionPropertyMap,
        nodeTypeShapeTemplateMap: nodeTypeShapeTemplateMap,
    };
};

DiagramBuilderDiagramActionApi.addActionConnectors = function(connectors, shapeTemplate) {
    if (connectors && connectors.length > 0) {
        // Fetch shape port template for each connector and add to this template's children array.
        for (var i = 0; i < connectors.length; i++) {
            var connector = connectors[i];
            var connectorTemplate = null;
            if (connector.connectorPort) {
                connectorTemplate = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(connector.connectorPort.shapeTemplate);
                if (connector.isDynamic) {
                    var dynamicPortShapeTemplate = DiagramBuilderShapeTemplateApi.generateShapeTemplateForDynamicPorts(connector, connectorTemplate);
                    shapeTemplate.children.push(dynamicPortShapeTemplate);
                } else {
                    shapeTemplate.children.push(connectorTemplate);
                }
            }
            if (!connector.isDynamic)
                DiagramBuilderDiagramActionApi.addPortConfiguration(connector, connectorTemplate, shapeTemplate);
        }
    } else {
        // As there are no connectors for this action, the entire node itself acts as port. So add a portId binding
        // with empty string.
        shapeTemplate.bindings.push({
            target: "portId",
            source: "portId_" + shapeTemplate.sysId,
            value: null,
            isDynamic: false,
            isCustom: false,
            isAdvanced: false,
            bindingFunction: null
        });
    }
};

DiagramBuilderDiagramActionApi.addPortConfiguration = function(connector, connectorTemplate, shapeTemplate) {
    var port = connector.connectorPort;
    //var connectorTemplate = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(connector.connectorPort.shapeTemplate);
    if (connectorTemplate) {
        connectorTemplate.bindings = connectorTemplate.bindings || [];

        // Every port needs two bindings to be available on port's shape template:
        // 1. alignment : Spot, where this port should appear. This is typically an instance of go.Spot
        // 2. portId: A unique identifier for this port, which should be referred by edges to start or end from/to this port.
        // All these proeprties are added as transient properties, so that getBindings method can do special handling for such properties, without lokking into DB.
        connectorTemplate.bindings.push({
            target: "alignment",
            source: "alignment_" + connector.sysId,
            isCustom: true,
            isAdvanced: false,
            isDynamic: false,
            value: null,
            bindingFunction: null,
            customValue: DiagramBuilderDiagramActionApi.buildSpotScript(port)
        });

        connectorTemplate.bindings.push({
            target: "portId",
            source: "portId_" + connector.sysId,
            value: connector.sysId, // Ports are identified by connector's sys ID.
            isCustom: false,
            isAdvanced: false,
            isDynamic: false,
            bindingFunction: null
        });
        DiagramBuilderDiagramActionApi.addRelinkingConfiguration(connector, connectorTemplate);

    } else {
        shapeTemplate.bindings = shapeTemplate.bindings || [];
        // As there is no connector template for this action, the entire node itself acts as port. So add a portId binding
        // to node.
        shapeTemplate.bindings.push({
            target: "portId",
            source: "portId_" + shapeTemplate.sysId,
            value: connector.sysId, // Ports are identified by connector's sys ID.
            isCustom: false,
            isAdvanced: false,
            isDynamic: false,
            bindingFunction: null
        });
        DiagramBuilderDiagramActionApi.addRelinkingConfiguration(connector, shapeTemplate);
    }
};

DiagramBuilderDiagramActionApi.addRelinkingConfiguration = function(connector, shapeTemplate) {
    // Assume it's an input port
    var fromLinkable = false;
    var toLinkable = true;

    // If it is an output connector, enable from linking and disable to linking.
    if (connector.direction === "output") {
        fromLinkable = true;
        toLinkable = false;
        if (connector.fromMaxLinks) {
            // In case of output ports, allow configured number of links emerging out of the port(if not configured, there are infinite number of links allowed).
            shapeTemplate.bindings.push({
                target: "fromMaxLinks",
                source: "fromMaxLinks_" + connector.sysId,
                value: connector.fromMaxLinks,
                isCustom: false,
                isAdvanced: false,
                isDynamic: false,
                bindingFunction: null
            });
        }
    } else if (connector.toMaxLinks) {
        // In case of input ports, allow configured number of links into the port(if not configured, there are infinite number of links allowed)
        shapeTemplate.bindings.push({
            target: "toMaxLinks",
            source: "toMaxLinks_" + connector.sysId,
            value: connector.toMaxLinks,
            isCustom: false,
            isAdvanced: false,
            isDynamic: false,
            bindingFunction: null
        });
    }

    shapeTemplate.bindings.push({
        target: "fromLinkable",
        source: "fromLinkable_" + connector.sysId,
        value: fromLinkable,
        isCustom: false,
        isDynamic: false,
        isAdvanced: false,
        bindingFunction: null
    });

    shapeTemplate.bindings.push({
        target: "toLinkable",
        source: "toLinkable_" + connector.sysId,
        value: toLinkable,
        isCustom: false,
        isDynamic: false,
        isAdvanced: false,
        bindingFunction: null
    });
};

DiagramBuilderDiagramActionApi.buildSpotScript = function(port) {
    var spotFunc = "function getValue(go) {return new go.Spot(" + port.spot.x + ", " + port.spot.y + ", " + port.offsetX + ", " + port.offsetY + ");}";
    return spotFunc;
};
