var ChangeModelAJAXProcessor = Class.create();
ChangeModelAJAXProcessor.prototype = Object.extendsObject(ChangeModelAJAXProcessorSNC, {
    initialize: function(request, responseXML, gc) {
		ChangeModelAJAXProcessorSNC.prototype.initialize.call(this, request, responseXML, gc);
    },

    type: 'ChangeModelAJAXProcessor'
});
