var DiagramBuilderCategory = Class.create();

// table name
DiagramBuilderCategory.TABLE = 'sn_diagram_builder_category';

// table fields
DiagramBuilderCategory.ACTIVE = 'active';
DiagramBuilderCategory.NAME = 'name';
DiagramBuilderCategory.ORDER = 'order';
DiagramBuilderCategory.PARENT = 'parent';
DiagramBuilderCategory.ICON = 'icon';
DiagramBuilderCategory.DESCRIPTION = 'description';
DiagramBuilderCategory.SYS_ID = 'sys_id';

// initialize script include by extending Crud base
DiagramBuilderCategory.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderCategory.TABLE;
    },

    type: 'DiagramBuilderCategory'
});

DiagramBuilderCategory.getDiagramBuilderRootCategories = function(categorySysIds) {
    var encodedQuery = DiagramBuilderCategory.ACTIVE + '=true^' + DiagramBuilderCategory.PARENT + 'ISEMPTY^' + DiagramBuilderCategory.SYS_ID + 'IN' + categorySysIds.join();
    return new DiagramBuilderCategory().getByQuery(encodedQuery);
};

DiagramBuilderCategory.getRootCategoriesByConfigId = function(configId) {
    var encodedQuery = DiagramBuilderCategory.ACTIVE + '=true^' + DiagramBuilderCategory.PARENT + 'ISEMPTY';
    return new DiagramBuilderCategory().getByQuery(encodedQuery);
};

DiagramBuilderCategory.getCategoryById = function(categoryId) {
    return new DiagramBuilderCategory().getById(categoryId);
};
