var DiagramBuilderShapeProperty = Class.create();

// table name
DiagramBuilderShapeProperty.TABLE = 'sn_diagram_builder_shape_property';

// table fields
DiagramBuilderShapeProperty.SHAPE_TEMPLATE = 'shape_template';
DiagramBuilderShapeProperty.CONSTANT_VALUE = 'constant_value';
DiagramBuilderShapeProperty.CUSTOM_VALUE = 'custom_value';
DiagramBuilderShapeProperty.TRANSLATION_VARIABLE = 'translation_variable';
DiagramBuilderShapeProperty.SOURCE_PROPERTY = 'source_property';
DiagramBuilderShapeProperty.TARGET_PROPERTY = 'target_property';
DiagramBuilderShapeProperty.IS_ADVANCED = 'is_advanced';
DiagramBuilderShapeProperty.BINDING_FUNCTION = 'binding_function';
DiagramBuilderShapeProperty.VALUE_TYPE = 'value_type';
DiagramBuilderShapeProperty.VARIABLE_NAME = 'variable_name';
DiagramBuilderShapeProperty.BUILDER_CONFIGURATION = 'builder_configuration';
DiagramBuilderShapeProperty.COMPONENT_TYPE = 'component_type';
DiagramBuilderShapeProperty.CONFIG_PROPERTY = 'config_property';

// allowed value types
DiagramBuilderShapeProperty.VALUE_TYPE_CONSTANT = 'constant';
DiagramBuilderShapeProperty.VALUE_TYPE_FUNCTION = 'function';
DiagramBuilderShapeProperty.VALUE_TYPE_DYNAMIC = 'dynamic';
DiagramBuilderShapeProperty.VALUE_TYPE_THEME_VARIABLE = 'theme_variable';
DiagramBuilderShapeProperty.VALUE_TYPE_TRANSLATION_KEY = 'translation_key';
DiagramBuilderShapeProperty.VALUE_TYPE_INTERNAL = 'internal';

// initialize script include by extending Crud base
DiagramBuilderShapeProperty.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderShapeProperty.TABLE;
    },
    type: 'DiagramBuilderShapeProperty'
});

DiagramBuilderShapeProperty.getPropertiesByShapeTemplateId = function(shapeTemplateId) {
    var encodedQuery = DiagramBuilderShapeProperty.SHAPE_TEMPLATE + '=' + shapeTemplateId;
    return new DiagramBuilderShapeProperty().getByQuery(encodedQuery);
};

DiagramBuilderShapeProperty.getPropertyById = function(shapePropertyId) {
    return new DiagramBuilderShapeProperty().getById(shapePropertyId);
};

DiagramBuilderShapeProperty.getPropertiesByConfigId = function(configId, componentType) {
    var encodedQuery = DiagramBuilderShapeProperty.BUILDER_CONFIGURATION + '=' + configId + '^';
    encodedQuery += DiagramBuilderShapeProperty.COMPONENT_TYPE + '=' + componentType;
    return new DiagramBuilderShapeProperty().getByQuery(encodedQuery);
};

/*
 * getDefaultValue:
 *    - Defaults the value for the columns in the dictionary level (sn_diagram_builder_shape_property) 
 * @params {String} fieldName - Field name/column name for which default value needs to be set.
 */
DiagramBuilderShapeProperty.getDefaultValue = function(fieldName) {
    switch (fieldName) {
        case DiagramBuilderShapeProperty.COMPONENT_TYPE:
            return 'node';
        case DiagramBuilderShapeProperty.CONFIG_PROPERTY:
            return false;
        default:
            return null;
    }
};
