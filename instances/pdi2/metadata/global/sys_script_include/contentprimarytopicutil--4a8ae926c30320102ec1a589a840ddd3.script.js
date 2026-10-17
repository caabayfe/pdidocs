var ContentPrimaryTopicUtil = Class.create();
ContentPrimaryTopicUtil.prototype = Object.extendsObject(ContentPrimaryTopicUtilSNC, {
    initialize: function () {
        ContentPrimaryTopicUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ContentPrimaryTopicUtil'
});
