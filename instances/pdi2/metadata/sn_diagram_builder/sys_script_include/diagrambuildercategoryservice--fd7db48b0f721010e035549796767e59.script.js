var DiagramBuilderCategoryService = Class.create();
DiagramBuilderCategoryService.prototype = {
    initialize: function() {},
    type: 'DiagramBuilderCategoryService'
};

DiagramBuilderCategoryService._getIcon = function(categoryGr) {
    var icon = categoryGr.getValue(DiagramBuilderCategory.ICON);
    if (!gs.nil(icon)) return icon;

    var parentId = categoryGr.getValue(DiagramBuilderCategory.PARENT);

    if (!gs.nil(parentId)) {
        var category = DiagramBuilderCategoryService.getCategoryById(parentId);
        if (!gs.nil(category.icon)) return category.icon;
    }

    return "/action-node.svg";
};

DiagramBuilderCategoryService._constructCategoryObject = function(categoryGr) {
    return {
        name: categoryGr.getValue(DiagramBuilderCategory.NAME),
        icon: DiagramBuilderCategoryService._getIcon(categoryGr),
        description: categoryGr.getValue(DiagramBuilderCategory.DESCRIPTION),
        active: categoryGr.getValue(DiagramBuilderCategory.ACTIVE),
        order: categoryGr.getValue(DiagramBuilderCategory.ORDER),
        parent: categoryGr.getValue(DiagramBuilderCategory.PARENT),
        sysId: categoryGr.getUniqueValue(),
        installed: true //A mandatory fields needed for action-picker, need append this on client side
    };
};

DiagramBuilderCategoryService.getCategoryById = function(categoryId) {
    var categoryGr = DiagramBuilderCategory.getCategoryById(categoryId);
    return DiagramBuilderCategoryService._constructCategoryObject(categoryGr);
};

DiagramBuilderCategoryService.getDiagramBuilderRootCategoriesByConfigId = function(configId) {
    var parentCategoryGr = DiagramBuilderCategory.getRootCategoriesByConfigId(configId);
    var categories = [];
    while (parentCategoryGr.next()) {
        categories.push(DiagramBuilderCategoryService._constructCategoryObject(parentCategoryGr));
    }

    return categories;
};

DiagramBuilderCategoryService.getDiagramBuilderRootCategories = function(categorySysIds) {
    var parentCategoryGr = DiagramBuilderCategory.getDiagramBuilderRootCategories(categorySysIds);
    var categories = [];

    while (parentCategoryGr.next()) {
        categories.push(DiagramBuilderCategoryService._constructCategoryObject(parentCategoryGr));
    }

    return categories;
};
