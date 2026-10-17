var DiagramBuilderDiagramAction = Class.create();

// table name
DiagramBuilderDiagramAction.TABLE = 'sn_diagram_builder_diagram_action';

// table fields
DiagramBuilderDiagramAction.ACTIVE = 'active';
DiagramBuilderDiagramAction.NAME = 'name';
DiagramBuilderDiagramAction.ORDER = 'order';
DiagramBuilderDiagramAction.DESCRIPTION = 'description';
DiagramBuilderDiagramAction.NODE_TYPE = 'node_type';
DiagramBuilderDiagramAction.SUB_CATEGORY = 'subcategory';
DiagramBuilderDiagramAction.CONFIGURATION = 'diagram_builder_configuration';
DiagramBuilderDiagramAction.CATEGORY = 'category';
DiagramBuilderDiagramAction.ICON = 'icon';
DiagramBuilderDiagramAction.ICON_TYPE = 'icon_type';

// initialize script include by extending Crud base
DiagramBuilderDiagramAction.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderDiagramAction.TABLE;
    },

    type: 'DiagramBuilderDiagramAction'
});


DiagramBuilderDiagramAction.getDiagramActionsByConfigId = function(configId) {
    var encodedQuery = DiagramBuilderDiagramAction.ACTIVE + '=true^' + DiagramBuilderDiagramAction.CONFIGURATION + '=' + configId;
    return new DiagramBuilderDiagramAction().getByQuery(encodedQuery);
};

DiagramBuilderDiagramAction.getDiagramBuilderDiagramActionsByCategoryId = function(configId, categoryId) {
    var encodedQuery = DiagramBuilderDiagramAction.ACTIVE + '=true^' + DiagramBuilderDiagramAction.CONFIGURATION + '=' + configId + '^' + DiagramBuilderDiagramAction.CATEGORY + '=' + categoryId;
    return new DiagramBuilderDiagramAction().getByQuery(encodedQuery);
};

DiagramBuilderDiagramAction.getAllDiagramActionsForSearchTerm = function(configId, searchTerm) {
    var encodedQuery = DiagramBuilderDiagramAction.ACTIVE + '=true^' + DiagramBuilderDiagramAction.CONFIGURATION + '=' + configId + '^' + DiagramBuilderDiagramAction.NAME + 'LIKE' + searchTerm;
    return new DiagramBuilderDiagramAction().getByQuery(encodedQuery);
};

DiagramBuilderDiagramAction.getDiagramActionById = function(diagramActionId) {
    return new DiagramBuilderDiagramAction().getById(diagramActionId);
};

DiagramBuilderDiagramAction.getDefaultValue = function(fieldName) {
    var defaultValue;
    switch (fieldName) {
        case DiagramBuilderDiagramAction.ICON_TYPE:
            defaultValue = "image";
            break;
    }
    return defaultValue;
};
