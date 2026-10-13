var MIMWorkbenchActionsAjax = Class.create();
MIMWorkbenchActionsAjax.prototype = Object.extendsObject(MIMWorkbenchActionsAjaxSNC, {
    initialize: function(request, responseXML, gc) {
		MIMWorkbenchActionsAjaxSNC.prototype.initialize.call(this, request, responseXML, gc);
    },

    type: 'MIMWorkbenchActionsAjax'
});
