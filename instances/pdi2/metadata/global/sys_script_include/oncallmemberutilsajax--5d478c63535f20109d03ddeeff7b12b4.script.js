var OnCallMemberUtilsAjax = Class.create();
OnCallMemberUtilsAjax.prototype = Object.extendsObject(OnCallMemberUtilsAjaxSNC, {

	initialize: function (request, responseXML, gc) {
		OnCallMemberUtilsAjaxSNC.prototype.initialize.call(this, request, responseXML, gc);
	},

    type: 'OnCallMemberUtilsAjax'
});
