var SOWIncidentUtilsAjax = Class.create();
SOWIncidentUtilsAjax.prototype = Object.extendsObject(SOWIncidentUtilsAjaxSNC, {
    initialize: function(request, responseXML, gc) {
        SOWIncidentUtilsAjaxSNC.prototype.initialize.call(this, request, responseXML, gc);
    },


    /***************Custom changes****************/
	
    type: 'SOWIncidentUtilsAjax'
});
