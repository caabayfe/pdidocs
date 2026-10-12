var TopicCategoryUtil = Class.create();
TopicCategoryUtil.prototype = Object.extendsObject(TopicCategoryUtilSNC, {
    initialize: function () {
        TopicCategoryUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TopicCategoryUtil'
});
