var SendToSelfUtil = Class.create();
    SendToSelfUtil.prototype = Object.extendsObject(SendToSelfUtilSNC, {
        initialize: function() {
        SendToSelfUtilSNC.prototype.initialize.apply(this, arguments);
        },

        type: 'SendToSelfUtil'
    });
