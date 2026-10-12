var DiagramBuilderShapeTemplateMap = Class.create();

// table name
DiagramBuilderShapeTemplateMap.TABLE = 'sn_diagram_builder_shape_template_m2m';

// table fields
DiagramBuilderShapeTemplateMap.SHAPE_TEMPLATE = 'shape_template';
DiagramBuilderShapeTemplateMap.ORDER = 'order';
DiagramBuilderShapeTemplateMap.PARENT = 'parent';
DiagramBuilderShapeTemplateMap.SPOT = 'spot';
DiagramBuilderShapeTemplateMap.TYPE = 'type';
DiagramBuilderShapeTemplateMap.PORT_OFFSET_X = 'port_offset_x';
DiagramBuilderShapeTemplateMap.PORT_OFFSET_Y = 'port_offset_y';
DiagramBuilderShapeTemplateMap.TABBABLE = 'tabbable';
DiagramBuilderShapeTemplateMap.ARIA_LABEL = 'aria_label';
DiagramBuilderShapeTemplateMap.TAB_CLICK_HANDLER = 'tab_click_handler';
DiagramBuilderShapeTemplateMap.HAS_TAB_HANDLER = 'has_tab_handler';

// initialize script include by extending Crud base
DiagramBuilderShapeTemplateMap.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderShapeTemplateMap.TABLE;
    },
    type: 'DiagramBuilderShapeTemplateMap'
});

DiagramBuilderShapeTemplateMap.getChildTemplateMapsByShapeTemplateId = function(shapeTemplateId) {
    var encodedQuery = DiagramBuilderShapeTemplateMap.PARENT + '=' + shapeTemplateId + '^ORDERBY' + DiagramBuilderShapeTemplateMap.ORDER;
    return new DiagramBuilderShapeTemplateMap().getByQuery(encodedQuery);
};

DiagramBuilderShapeTemplateMap.getShapeTemplateMapById = function(mappingId) {
    return new DiagramBuilderShapeTemplateMap().getById(mappingId);
};
