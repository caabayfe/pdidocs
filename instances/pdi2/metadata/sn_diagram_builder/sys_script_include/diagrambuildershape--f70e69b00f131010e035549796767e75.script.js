var DiagramBuilderShape = Class.create();

// table name
DiagramBuilderShape.TABLE = 'sn_diagram_builder_shape';

// table fields
DiagramBuilderShape.ACTIVE = 'active';
DiagramBuilderShape.COMPONENT_NAME = 'component_name';
DiagramBuilderShape.COMPONENT_TYPE = 'component_type';
DiagramBuilderShape.SCRIPT = 'script';
DiagramBuilderShape.IS_CUSTOM = 'is_custom';
DiagramBuilderShape.DESCRIPTION = 'description';

// initialize script include by extending Crud base
DiagramBuilderShape.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderShape.TABLE;
    },
    type: 'DiagramBuilderShape'
});
DiagramBuilderShape.getCustomShapes = function() {
    var encodedQuery = DiagramBuilderShape.ACTIVE + '=true^' + DiagramBuilderShape.IS_CUSTOM + '=true^';
    return new DiagramBuilderShape().getByQuery(encodedQuery);
};

DiagramBuilderShape.getShapesByQuery = function(encodedQuery) {
    return new DiagramBuilderShape().getByQuery(encodedQuery);
};

DiagramBuilderShape.getShapeById = function(shapeId) {
    return new DiagramBuilderShape().getById(shapeId);
};
