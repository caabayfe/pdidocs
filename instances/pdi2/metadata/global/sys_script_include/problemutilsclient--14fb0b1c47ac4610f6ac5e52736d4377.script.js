var ProblemUtilsClient = Class.create();
ProblemUtilsClient.prototype = Object.extendsObject(ProblemUtilsClientSNC, {

    initialize: function(request, responseXML, gc) { 
        ProblemUtilsClientSNC.prototype.initialize.call(this, request, responseXML, gc);
    },

    type: 'ProblemUtilsClient'
});
