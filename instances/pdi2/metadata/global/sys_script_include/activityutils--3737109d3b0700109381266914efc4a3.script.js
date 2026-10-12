var ActivityUtils = Class.create();
ActivityUtils.prototype =  Object.extendsObject(ActivityUtilsSNC, {
    initialize: function() {
		ActivityUtilsSNC.prototype.initialize.call(this);
    },

    type: 'ActivityUtils'
});
