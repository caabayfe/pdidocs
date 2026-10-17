var DiagramBuilderShapePropertyOverride = Class.create();

// table name
DiagramBuilderShapePropertyOverride.TABLE = 'sn_diagram_builder_shape_property_override';

// table fields
DiagramBuilderShapePropertyOverride.SHAPE_PROPERTY = 'shape_property';
DiagramBuilderShapePropertyOverride.SHAPE_TEMPLATE_MAP = 'shape_template_map';
DiagramBuilderShapePropertyOverride.OVERRIDDEN_SOURCE_PROPERTY = 'source_property';
DiagramBuilderShapePropertyOverride.BINDING_FUNCTION = 'binding_function';
DiagramBuilderShapePropertyOverride.CONSTANT_VALUE = 'constant_value';
DiagramBuilderShapePropertyOverride.CUSTOM_VALUE = 'custom_value';
DiagramBuilderShapePropertyOverride.TRANSLATION_VARIABLE = 'translation_variable';
DiagramBuilderShapePropertyOverride.SOURCE_PROPERTY = 'source_property';
DiagramBuilderShapePropertyOverride.IS_ADVANCED = 'is_advanced';
DiagramBuilderShapePropertyOverride.VALUE_TYPE = 'value_type';
DiagramBuilderShapePropertyOverride.VARIABLE_NAME = 'variable_name';

// allowed value types
DiagramBuilderShapePropertyOverride.VALUE_TYPE_CONSTANT = 'constant';
DiagramBuilderShapePropertyOverride.VALUE_TYPE_FUNCTION = 'function';
DiagramBuilderShapePropertyOverride.VALUE_TYPE_DYNAMIC = 'dynamic';
DiagramBuilderShapePropertyOverride.VALUE_TYPE_THEME_VARIABLE = 'theme_variable';
DiagramBuilderShapePropertyOverride.VALUE_TYPE_TRANSLATION_KEY = 'translation_key';
DiagramBuilderShapePropertyOverride.VALUE_TYPE_INTERNAL = 'internal';

// initialize script include by extending Crud base
DiagramBuilderShapePropertyOverride.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderShapePropertyOverride.TABLE;
    },
    type: 'DiagramBuilderShapePropertyOverride'
});

DiagramBuilderShapePropertyOverride.getPropertyOverrideByTemplateMapId = function(templateMapId) {
    var encodedQuery = DiagramBuilderShapePropertyOverride.SHAPE_TEMPLATE_MAP + '=' + templateMapId;
    return new DiagramBuilderShapePropertyOverride().getByQuery(encodedQuery);
};
