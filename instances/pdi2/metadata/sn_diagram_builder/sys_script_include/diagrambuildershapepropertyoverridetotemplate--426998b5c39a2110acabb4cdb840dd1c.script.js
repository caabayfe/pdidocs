var DiagramBuilderShapePropertyOverrideToTemplate = Class.create();


// table name
DiagramBuilderShapePropertyOverrideToTemplate.TABLE = 'sn_diagram_builder_shape_property_override_to_shape_template';

// table fields
DiagramBuilderShapePropertyOverrideToTemplate.SHAPE_TEMPLATE = 'shape_template';
DiagramBuilderShapePropertyOverrideToTemplate.SHAPE_PROPERTY_OVERRIDE = 'shape_property_override';
DiagramBuilderShapePropertyOverrideToTemplate.ORDER = 'order';

// initialize script include by extending Crud base
DiagramBuilderShapePropertyOverrideToTemplate.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderShapePropertyOverrideToTemplate.TABLE;
    },
    type: 'DiagramBuilderShapePropertyOverrideToTemplate'
});

DiagramBuilderShapePropertyOverrideToTemplate.getDependentShapeTemplatesByPropertyOverrideId = function(shapePropertyOverrideId) {
    var encodedQuery = DiagramBuilderShapePropertyOverrideToTemplate.SHAPE_PROPERTY_OVERRIDE + "=" + shapePropertyOverrideId + "^ORDERBY" + DiagramBuilderShapePropertyOverrideToTemplate.ORDER;
    return new DiagramBuilderShapePropertyOverrideToTemplate().getByQuery(encodedQuery);
};
