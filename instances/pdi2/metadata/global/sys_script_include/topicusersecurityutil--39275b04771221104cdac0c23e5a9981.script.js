var TopicUserSecurityUtil = Class.create();
TopicUserSecurityUtil.prototype = Object.extendsObject(TopicUserSecurityUtilSNC, {
    initialize: function () {
        TopicUserSecurityUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TopicUserSecurityUtil'
});
