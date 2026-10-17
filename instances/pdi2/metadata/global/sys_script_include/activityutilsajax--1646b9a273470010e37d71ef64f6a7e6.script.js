var ActivityUtilsAJAX = Class.create();
ActivityUtilsAJAX.prototype = Object.extendsObject(ActivityUtilsAjaxSNC, AbstractAjaxProcessor, {
	
	initialize: function() {
		ActivityUtilsAjaxSNC.prototype.initialize.call(this);
    },
	
    type: 'ActivityUtilsAJAX'
});
