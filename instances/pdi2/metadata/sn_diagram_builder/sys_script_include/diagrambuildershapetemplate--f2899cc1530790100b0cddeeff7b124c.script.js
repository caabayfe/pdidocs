var DiagramBuilderShapeTemplate = Class.create();

// table name
DiagramBuilderShapeTemplate.TABLE = 'sn_diagram_builder_shape_template';

// table fields
DiagramBuilderShapeTemplate.NAME = 'name';
DiagramBuilderShapeTemplate.ACTIVE = 'active';
DiagramBuilderShapeTemplate.DESCRIPTION = 'description';
DiagramBuilderShapeTemplate.SCRIPT = 'script';
DiagramBuilderShapeTemplate.SHAPE = 'shape';
DiagramBuilderShapeTemplate.IS_ADVANCED = 'is_advanced';
DiagramBuilderShapeTemplate.TYPE = 'type';
DiagramBuilderShapeTemplate.PROPERTIES = 'properties';
DiagramBuilderShapeTemplate.SPOT = 'spot';
DiagramBuilderShapeTemplate.TEMPLATE_TYPE = 'template_type';
DiagramBuilderShapeTemplate.TABBABLE = 'tabbable';
DiagramBuilderShapeTemplate.ARIA_LABEL = 'aria_label';
DiagramBuilderShapeTemplate.TAB_CLICK_HANDLER = 'tab_click_handler';
DiagramBuilderShapeTemplate.HAS_TAB_HANDLER = 'has_tab_handler';
DiagramBuilderShapeTemplate.HAS_RECENTER_HANDLER = 'has_recenter_handler';
DiagramBuilderShapeTemplate.RECENTER_HANDLER = 'recenter_handler';

DiagramBuilderShapeTemplate.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderShapeTemplate.TABLE;
    },
    type: 'DiagramBuilderShapeTemplate'
});

DiagramBuilderShapeTemplate.getShapeTemplatesByIDs = function(shapeTemplateIDArray) {
    var encodedQuery = "sys_idIN" + shapeTemplateIDArray.join();
    return new DiagramBuilderShapeTemplate().getByQuery(encodedQuery);
};

DiagramBuilderShapeTemplate.getShapeTemplateById = function(shapeTemplateId) {
    return new DiagramBuilderShapeTemplate().getById(shapeTemplateId);
};
