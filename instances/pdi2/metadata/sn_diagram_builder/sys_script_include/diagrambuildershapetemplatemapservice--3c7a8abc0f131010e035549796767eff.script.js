var DiagramBuilderShapeTemplateMapService = Class.create();

DiagramBuilderShapeTemplateMapService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderShapeTemplateMapService'
};

// ARRAY to hold current parent and its parents to exclude
var allParents = [];

var getParentShapeTemplates = function (shapeTemplate) {

	var shapeTemplateM2Ms = new GlideRecord('sn_diagram_builder_shape_template_m2m');
	// 2. Build query
	shapeTemplateM2Ms.addQuery('shape_template', shapeTemplate);

	// 3. Execute query 
	shapeTemplateM2Ms.query();

	// 4. Process returned records
	while (shapeTemplateM2Ms.next()) {
		if (shapeTemplateM2Ms.parent.sys_id) {
			allParents.push(shapeTemplateM2Ms.parent.sys_id);

			//check recursively for parents of this parent
			getParentShapeTemplates(shapeTemplateM2Ms.parent.sys_id);
		}
	}
};

DiagramBuilderShapeTemplateMapService.excludeParentShapeTemplates = function (parent) {
	if (parent) {
		allParents.push(parent);
		getParentShapeTemplates(parent);
	}
	return allParents;

};

DiagramBuilderShapeTemplateMapService.getChildTemplateMapsByShapeTemplateId = function(shapeTemplateId) {
    var templateMapsGr = DiagramBuilderShapeTemplateMap.getChildTemplateMapsByShapeTemplateId(shapeTemplateId);
    var templateMaps = [];
    while (templateMapsGr.next()) {
        templateMaps.push({
			tabbable: templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.TABBABLE) === "1",
			ariaLabel: templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.ARIA_LABEL),
            tabClickHandler: templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.TAB_CLICK_HANDLER),
			hasTabHandler: templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.HAS_TAB_HANDLER) === "1",
            shapeTemplate: templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.SHAPE_TEMPLATE),
            order: templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.ORDER),
            parent: templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.PARENT),
			port: { // Add port override configuration
				type: templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.TYPE),
				spot: DiagramBuilderSpotService.getSpotById(templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.SPOT)),
				offsetX: isNaN(templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.PORT_OFFSET_X)) ? 0 : templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.PORT_OFFSET_X),
				offsetY: isNaN(templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.PORT_OFFSET_Y)) ? 0 : templateMapsGr.getValue(DiagramBuilderShapeTemplateMap.PORT_OFFSET_Y),
			},	
            sysId: templateMapsGr.getUniqueValue()
        });
    }
    return templateMaps;
};

DiagramBuilderShapeTemplateMapService.isChildShapeTemplatePort = function(mappingId) {
	var shapeTemplateMapGr = DiagramBuilderShapeTemplateMap.getShapeTemplateMapById(mappingId);
	var childShapeTemplate = shapeTemplateMapGr.getValue(DiagramBuilderShapeTemplateMap.SHAPE_TEMPLATE);
	var shapeTemplateGr = DiagramBuilderShapeTemplate.getShapeTemplateById(childShapeTemplate);
	return shapeTemplateGr.getClassDisplayValue() === "Shape Port";	
};
