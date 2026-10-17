var DiagramActionArguments = Class.create();
DiagramActionArguments.TABLE = "sn_diagram_builder_diagram_action_argument";

DiagramActionArguments.ACTIVE = "active";
DiagramActionArguments.DIRECTION = "direction";
DiagramActionArguments.MANDATORY = "mandatory";
DiagramActionArguments.NAME = "name";
DiagramActionArguments.ORDER = "order";
DiagramActionArguments.TYPE = "type";
DiagramActionArguments.DEFAULT_VALUE = "default_value";
DiagramActionArguments.DIAGRAM_ACTION = "diagram_action";
DiagramActionArguments.LABEL = "label";
DiagramActionArguments.DESCRIPTION = "description";

DiagramActionArguments.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramActionArguments.TABLE;
    },

    type: 'DiagramActionArguments'
});

DiagramActionArguments.getArgumentsByActionId = function(actionId) {
    var encodedQuery = DiagramActionArguments.ACTIVE + '=true^' + DiagramActionArguments.DIAGRAM_ACTION + '=' + actionId;
    return new DiagramActionArguments().getByQuery(encodedQuery);
};

DiagramActionArguments.getActionArgumentsById = function(argumentId) {
    return new DiagramActionArguments().getById(argumentId);
};

DiagramActionArguments.getArgumentsByActionIdWithDirection = function(actionId, direction) {
    var encodedQuery = DiagramActionArguments.ACTIVE + '=true^' + DiagramActionArguments.DIAGRAM_ACTION + '=' + actionId;
    if (direction)
        encodedQuery = encodedQuery + '^' + DiagramActionArguments.DIRECTION + '=' + direction;
    return new DiagramActionArguments().getByQuery(encodedQuery);
};
