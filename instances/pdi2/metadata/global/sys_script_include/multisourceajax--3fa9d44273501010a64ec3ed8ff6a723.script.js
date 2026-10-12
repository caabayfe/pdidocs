var MultiSourceAjax = Class.create();
MultiSourceAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	isEnabled : function() {
		return SNC.MultiSourceScriptableApi.isMultiSourceEnabled();
	},

    type: 'MultiSourceAjax'
});
