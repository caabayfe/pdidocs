var TopicServiceUtil = Class.create();
TopicServiceUtil.prototype = Object.extendsObject(TopicServiceUtilSNC, {
    initialize: function() {
		TopicServiceUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TopicServiceUtil'
});
