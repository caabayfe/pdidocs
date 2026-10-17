var SOWInteractionUtils = Class.create();
SOWInteractionUtils.prototype = Object.extendsObject(SOWInteractionUtilsSNC, {
    initialize: function() {
		SOWInteractionUtilsSNC.prototype.initialize.call(this);
    },

    type: 'SOWInteractionUtils'
});
