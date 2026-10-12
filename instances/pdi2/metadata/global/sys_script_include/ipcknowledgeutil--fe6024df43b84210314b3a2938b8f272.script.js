var IPCKnowledgeUtil = Class.create();

IPCKnowledgeUtil.prototype = Object.extendsObject(IPCKnowledgeUtilSNC, {

    initialize: function(request, responseXML, gc) {
        IPCKnowledgeUtilSNC.prototype.initialize.call(this, request, responseXML, gc);
    },
	
    type: 'IPCKnowledgeUtil'
});
