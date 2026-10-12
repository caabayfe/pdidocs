var DiagramBuilderPaletteUtils = Class.create();
DiagramBuilderPaletteUtils.prototype = {
    initialize: function() {},

    /** 
     * Building the palette JSON required for the Palette model to render.
     * @param {Array} diagramActionArray - Array of diagram actions from GraphQL response.
     */
    buildPaletteJSON: function(diagramActionArray) {
        let paletteJSON = [];
        diagramActionArray.forEach(diagramAction => {
            const shapeTemplateId = diagramAction?.nodeType?.sysId;
            const actionData = DiagramBuilderDiagramActionApi.getShapeTemplateByActionId(diagramAction?.id);

            if (shapeTemplateId) {
                const paletteObject = {
                    ...diagramAction,
                    ...actionData?.actionPropertyMap?.[diagramAction?.id] || {},
                    templateId: shapeTemplateId,
                    actionId: diagramAction.id,
                    node_id: diagramAction.id,
                    _isPaletteNode: true,
                    _isInvalid: false,
                    logo: actionData?.actionPropertyMap?.[diagramAction?.id].icon,
                };

                // Go js expects isGroup property to be set to true, for group nodes to work as expected.
                if (actionData?.nodeTypeShapeTemplateMap?.[shapeTemplateId]?.shape?.componentType === "Group") {
                    paletteObject.isGroup = true;
                }
                paletteJSON.push(paletteObject);
            }
        });

        return paletteJSON;
    },

    type: 'DiagramBuilderPaletteUtils'
};
