var ActionUtil = Class.create();
ActionUtil.prototype =Object.extendsObject(ActionUtilSNC, {
    initialize: function() {
		ActionUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ActionUtil'
});
