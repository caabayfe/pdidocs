var TopicPageUtil = Class.create();
TopicPageUtil.prototype = Object.extendsObject(TopicPageUtilSNC, {
    initialize: function() {
		TopicPageUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TopicPageUtil'
});
