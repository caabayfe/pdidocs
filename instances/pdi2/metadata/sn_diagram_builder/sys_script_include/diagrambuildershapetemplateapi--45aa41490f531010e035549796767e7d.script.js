var DiagramBuilderShapeTemplateApi = Class.create();

DiagramBuilderShapeTemplateApi.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderShapeTemplateApi'
};

DiagramBuilderShapeTemplateApi.getBindings = function(properties, overrides, configProps) {
    var bindings = {}; 
    configProps.forEach(function(property) {
        var target = property.targetProperty;
        var source = target + '_' + property.sysId;

        if (!gs.nil(property.sourceProperty))
            source = property.sourceProperty;

        var binding = {
            target: target,
            source: source,
            value: property.constantValue,
            sysId: property.sysId,
            isAdvanced: property.isAdvanced,
            bindingFunction: property.bindingFunction,
            isCustom: property.isCustom,
            isDynamic: property.isDynamic,
            isInternal: property.isInternal,
            customValue: property.customValue,
            isTranslationKey: property.isTranslationKey,
            translationVariable: property.translationVariable,
            isThemeVariable: property.isThemeVariable,
            variableName: property.variableName,
            isConfigProperty: property.isConfigProperty,
            componentType: property.componentType,
            builderConfiguration: property.builderConfiguration
        };

        var dependentShapeTemplates = [];
        if (binding.isCustom && !gs.nil(binding.customValue)) {
            dependentShapeTemplates = DiagramBuilderShapePropertyToTemplateService.getDependentTemplatesForProperty(binding.sysId);
        }
        binding['dependentShapeTemplates'] = dependentShapeTemplates;

        bindings[target] = binding;
    });

    properties.forEach(function(property) {
        var target = property.targetProperty;
        var source = target + '_' + property.sysId;

        if (!gs.nil(property.sourceProperty))
            source = property.sourceProperty;

        var binding = {
            target: target,
            source: source,
            value: property.constantValue,
            sysId: property.sysId,
            isAdvanced: property.isAdvanced,
            bindingFunction: property.bindingFunction,
            isCustom: property.isCustom,
            isDynamic: property.isDynamic,
            isInternal: property.isInternal,
            customValue: property.customValue,
            isTranslationKey: property.isTranslationKey,
            translationVariable: property.translationVariable,
            isThemeVariable: property.isThemeVariable,
            variableName: property.variableName
        };

        var dependentShapeTemplates = [];
        if (binding.isCustom && !gs.nil(binding.customValue)) {
            dependentShapeTemplates = DiagramBuilderShapePropertyToTemplateService.getDependentTemplatesForProperty(binding.sysId);
        }
        binding['dependentShapeTemplates'] = dependentShapeTemplates;

        bindings[target] = binding;
    });

    overrides.forEach(function(override) {
        var shapeProperty = {};
        // Transient properties are for properties which we add on the fly to a shape template to configure things like spots.
        if (override.isTransient) {
            var transientBinding = {
                target: override.targetProperty,
                source: override.sourceProperty,
                isAdvanced: override.isAdvanced,
                bindingFunction: override.bindingFunction,
                constantValue: override.constantValue,
                isCustom: override.isCustom,
                isInternal: override.isInternal,
                customValue: override.customValue,
                isTranslationKey: override.isTranslationKey,
                translationVariable: override.translationVariable,
                isThemeVariable: override.isThemeVariable,
                variableName: override.variableName
            };
            bindings[override.targetProperty] = transientBinding;
        } else {
            shapeProperty = DiagramBuilderShapePropertyService.getPropertyById(override.shapeProperty);
            var target = shapeProperty.targetProperty;
            var source = target + '_' + override.shapeTemplateMap + '_' + shapeProperty.sysId;

            if (!gs.nil(override.sourceProperty))
                source = override.sourceProperty;

            var binding = {
                target: target,
                source: source,
                value: override.constantValue,
                sysId: shapeProperty.sysId,
                isAdvanced: override.isAdvanced,
                bindingFunction: override.isAdvanced ? override.bindingFunction : shapeProperty.bindingFunction,
                isCustom: override.isCustom,
                isInternal: override.isInternal,
                isDynamic: override.isDynamic,
                customValue: override.isCustom ? override.customValue : shapeProperty.customValue,
                isTranslationKey: override.isTranslationKey,
                translationVariable: override.translationVariable,
                isThemeVariable: override.isThemeVariable,
                variableName: override.variableName
            };

            var dependentShapeTemplates = [];
            if (binding.isCustom && !gs.nil(binding.customValue)) {
                dependentShapeTemplates = DiagramBuilderShapePropertyOverrideToTemplateService.getDependentTemplatesForPropertyOverride(override.sysId);
            }
            binding['dependentShapeTemplates'] = dependentShapeTemplates;
            bindings[target] = binding;
        }
    });

    var bindingsArray = [];

    for (var binding in bindings) {
        if (bindings.hasOwnProperty(binding)) {
            bindingsArray.push(bindings[binding]);
        }
    }

    return bindingsArray;
};

DiagramBuilderShapeTemplateApi.getShapeTemplateJson = function(shapeTemplateId, propertyOverrides, map, configId) {
    propertyOverrides = propertyOverrides || [];
    map = map || {};
    var template = DiagramBuilderShapeTemplateService.getShapeTemplateById(shapeTemplateId);
    var properties = DiagramBuilderShapePropertyService.getPropertiesByShapeTemplateId(shapeTemplateId);
    var templateChildMaps = DiagramBuilderShapeTemplateMapService.getChildTemplateMapsByShapeTemplateId(shapeTemplateId);
    var shape = DiagramBuilderShapeService.getShapeById(template.shape);
    var childShapeTemplates = [];
    var configProps = [];
    if (template.templateType === 'base') {
        var componentType = '';
        if (shape.componentType) {
            componentType = shape.componentType.toLowerCase();
        } else {
            componentType = shape.componentName.toLowerCase();
        }
        configProps = DiagramBuilderShapePropertyService.getPropertiesByConfigId(configId, componentType);
    }

    templateChildMaps.forEach(function(map) {
        var overrides = DiagramBuilderShapePropertyOverrideService.getPropertyOverrideByTemplateMapId(map.sysId) || [];
        var childShapeTemplate = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(map.shapeTemplate, overrides, map);
        if (childShapeTemplate) {
            // If the shape template is a Loader Animation Icon Template, wrap it in a Table Panel Template to ensure the animation loads with a fixed height and width.
            if (childShapeTemplate.sysId == BuilderConstants.LOADER_ANIMATION_ICON_TEMPLATE) {
                var loaderStateContainerShapeTemplate = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(BuilderConstants.LOADER_STATE_TABLE_PANEL_TEMPLATE_ID);
                loaderStateContainerShapeTemplate.children.push(childShapeTemplate);
                childShapeTemplates.push(loaderStateContainerShapeTemplate);
            } else {
                childShapeTemplates.push(childShapeTemplate);
            }
        }
    });

    var shapeTemplate = {
        sysId: template.sysId,
        name: template.name,
        description: template.description,
        tabbable: map.tabbable || template.tabbable,
        ariaLabel: map.ariaLabel || template.ariaLabel,
        hasTabHandler: map.hasTabHandler || template.hasTabHandler,
        tabClickHandler: map.hasTabHandler ? map.tabClickHandler : template.tabClickHandler,
        isAdvanced: template.isAdvanced,
        script: template.script,
        shape: {
            componentName: shape.componentName,
            componentType: shape.componentType,
            sysId: shape.sysId
        },
        bindings: DiagramBuilderShapeTemplateApi.getBindings(properties, propertyOverrides, configProps),
        children: childShapeTemplates,
        recenterHandler: template.recenterHandler,
        order: map.order
    };

    return shapeTemplate;
};

DiagramBuilderShapeTemplateApi.getShapeTemplatesJson = function(shapeTemplateIds) {
    shapeTemplateIds = shapeTemplateIds || [];
    var shapeTemplatesJson = [];

    shapeTemplateIds.forEach(function(shapeTemplateId) {
        var templateJson = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(shapeTemplateId, []);
        shapeTemplatesJson.push(templateJson);
    });

    return shapeTemplatesJson;
};

DiagramBuilderShapeTemplateApi.generateShapeTemplateForDynamicPorts = function(connector, portShapeTemplate) {
    var spotName = connector.connectorPort.spot.spotName;

    // initially assume that ports panel container is vertial
    var isPortDirectionVertical = true;
    var portContainerShapeTemplateId = BuilderConstants.DYNAMIC_PORT_VERTICAL_PANEL_TEMPLATE_ID;

    if (BuilderConstants.HORIZONTAL_SPOTS.indexOf(spotName) !== -1) {
        isPortDirectionVertical = false;
        portContainerShapeTemplateId = BuilderConstants.DYNAMIC_PORT_HORIZONTAL_PANEL_TEMPLATE_ID;
    }

    var portContainerShapeTemplate = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(portContainerShapeTemplateId);

    portContainerShapeTemplate.bindings.push({
        target: "alignment",
        source: "alignment_" + gs.generateGUID(),
        isCustom: true,
        isAdvanced: false,
        isDynamic: false,
        value: null,
        bindingFunction: null,
        customValue: "function getValue(go) {return go.Spot." + spotName + ";}"
    });

    portContainerShapeTemplate.bindings.push({
        target: 'itemArray',
        source: connector.direction + '_ports',
        value: null,
        isCustom: false,
        isAdvanced: false,
        isDynamic: true,
        bindingFunction: null,
    });

    var portItemShapeTemplate = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(BuilderConstants.DYNAMIC_PORT_AUTO_PANEL_TEMPLATE_ID);

    portItemShapeTemplate.bindings.push({
        target: "margin",
        source: "margin_" + gs.generateGUID(),
        isCustom: true,
        isAdvanced: false,
        isDynamic: false,
        value: null,
        bindingFunction: null,
        customValue: isPortDirectionVertical ?
            "function getValue(go) {return new go.Margin(0, 0, 4, 0);}" : "function getValue(go) {return new go.Margin(0, 4, 0, 0);}"
    });

    // push port shape template to auto panel
    portItemShapeTemplate.children.push(portShapeTemplate);

    DiagramBuilderDiagramActionApi.addRelinkingConfiguration(connector, portItemShapeTemplate);

    // populate required details on container shape template
    portContainerShapeTemplate.isDynamicPortShapeTemplate = true;
    portContainerShapeTemplate.itemTemplateShapeTemplate = portItemShapeTemplate;
    portContainerShapeTemplate.enablePortContextMenu = connector.enablePortContextMenu;

    return portContainerShapeTemplate;
};
