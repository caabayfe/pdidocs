var DiagramBuilderNodeMenuOption = Class.create();

// table name
DiagramBuilderNodeMenuOption.TABLE = 'sn_diagram_builder_node_type_context_menu_option_m2m';

// table fields
DiagramBuilderNodeMenuOption.NODE_TYPE = 'node_type';
DiagramBuilderNodeMenuOption.MENU_OPTION = 'menu_option';
DiagramBuilderNodeMenuOption.ACTIVE = "active";
DiagramBuilderNodeMenuOption.ORDER = "order";

DiagramBuilderNodeMenuOption.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderNodeMenuOption.TABLE;
    },
    type: 'DiagramBuilderNodeMenuOption'
});

DiagramBuilderNodeMenuOption.getOptionsByNodeType = function(nodeType) {
	var encodedQuery = DiagramBuilderNodeMenuOption.NODE_TYPE + '=' + nodeType + '^active=true^ORDERBY' + DiagramBuilderNodeMenuOption.ORDER;
    return new DiagramBuilderNodeMenuOption().getByQuery(encodedQuery);
};
