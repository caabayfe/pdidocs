var OnCallNotifyUtil = Class.create();
OnCallNotifyUtil.prototype = Object.extendsObject(OnCallNotifyUtilSNC, {

    initialize: function() {
        OnCallNotifyUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'OnCallNotifyUtil'
});
