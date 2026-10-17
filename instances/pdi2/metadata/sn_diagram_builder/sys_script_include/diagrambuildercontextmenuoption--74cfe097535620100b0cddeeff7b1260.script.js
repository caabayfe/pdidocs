var DiagramBuilderContextMenuOption = Class.create();

// table name
DiagramBuilderContextMenuOption.TABLE = 'sn_diagram_builder_context_menu_option';

// table fields
DiagramBuilderContextMenuOption.NAME = 'name';
DiagramBuilderContextMenuOption.SCRIPT = 'script';
DiagramBuilderContextMenuOption.VISIBILITY_CONDITION = "visibility_condition";
DiagramBuilderContextMenuOption.DISABLE_CONDITION = "disable_condition";

DiagramBuilderContextMenuOption.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderContextMenuOption.TABLE;
    },
    type: 'DiagramBuilderContextMenuOption'
});

DiagramBuilderContextMenuOption.getOptionByID = function(sysId) {
    return new DiagramBuilderContextMenuOption().getById(sysId);
};
