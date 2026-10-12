var TopicSecurityUtil = Class.create();
TopicSecurityUtil.prototype = Object.extendsObject(TopicSecurityUtilSNC, {
    initialize: function() {
        TopicSecurityUtilSNC.prototype.initialize.apply(this, arguments);
    },
    type: 'TopicSecurityUtil'
});
