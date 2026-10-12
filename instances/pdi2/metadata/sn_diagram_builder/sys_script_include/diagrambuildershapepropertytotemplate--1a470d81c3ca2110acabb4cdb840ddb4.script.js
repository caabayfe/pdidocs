var DiagramBuilderShapePropertyToTemplate = Class.create();


// table name
DiagramBuilderShapePropertyToTemplate.TABLE = 'sn_diagram_builder_shape_property_to_shape_template';

// table fields
DiagramBuilderShapePropertyToTemplate.SHAPE_TEMPLATE = 'shape_template';
DiagramBuilderShapePropertyToTemplate.SHAPE_PROPERTY = 'shape_property';
DiagramBuilderShapePropertyToTemplate.ORDER = 'order';

// initialize script include by extending Crud base
DiagramBuilderShapePropertyToTemplate.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderShapePropertyToTemplate.TABLE;
    },
    type: 'DiagramBuilderShapePropertyToTemplate'
});

DiagramBuilderShapePropertyToTemplate.getDependentShapeTemplatesByPropertyId = function(shapePropertyId) {
    var encodedQuery = DiagramBuilderShapePropertyToTemplate.SHAPE_PROPERTY + "=" + shapePropertyId + "^ORDERBY" + DiagramBuilderShapePropertyToTemplate.ORDER;
    return new DiagramBuilderShapePropertyToTemplate().getByQuery(encodedQuery);
};
