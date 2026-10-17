var DiagramBuilderExtension = Class.create();

// table name
DiagramBuilderExtension.TABLE = 'sn_diagram_builder_extension';

// table fields
DiagramBuilderExtension.ACTIVE = 'active';
DiagramBuilderExtension.NAME = 'name';
DiagramBuilderExtension.SCRIPT = 'script';

// initialize script include by extending Crud base
DiagramBuilderExtension.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderExtension.TABLE;
    },
    type: 'DiagramBuilderExtension'
});

DiagramBuilderExtension.getDefaultValue = function() {
    return `function loadExtension($, go) {
    //Add the extension script
    //Add the extension class to the window object
    //window.FishboneLayout = FishboneLayout;
}`
};

DiagramBuilderExtension.getExtensions = function() {
    var encodedQuery = DiagramBuilderExtension.ACTIVE + '=true^';
    return new DiagramBuilderExtension().getByQuery(encodedQuery);
};
