var TopicPermissionUtil = Class.create();
TopicPermissionUtil.prototype = Object.extendsObject(TopicPermissionUtilSNC, {
    initialize: function() {
		TopicPermissionUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TopicPermissionUtil'
});
