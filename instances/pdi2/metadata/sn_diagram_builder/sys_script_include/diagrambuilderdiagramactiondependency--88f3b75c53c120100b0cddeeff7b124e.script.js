var DiagramBuilderDiagramActionDependency = Class.create();


// table name
DiagramBuilderDiagramActionDependency.TABLE = 'sn_diagram_builder_diagram_action_dependency';

// table fields
DiagramBuilderDiagramActionDependency.ACTION = 'action';
DiagramBuilderDiagramActionDependency.ACTION_DEPENDENCY = 'action_dependency';
DiagramBuilderDiagramActionDependency.ORDER = 'order';

DiagramBuilderDiagramActionDependency.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderDiagramActionDependency.TABLE;
    },

    type: 'DiagramBuilderDiagramActionDependency'
});

DiagramBuilderDiagramActionDependency.getActionDependencies = function(actionId) {
    var encodedQuery = DiagramBuilderDiagramActionDependency.ACTION + '=' + actionId + '^ORDERBY' + DiagramBuilderDiagramActionDependency.ORDER;
    return new DiagramBuilderDiagramActionDependency().getByQuery(encodedQuery);
};
