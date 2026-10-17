var SOWIncidentKnowledgeUtils = Class.create();
SOWIncidentKnowledgeUtils.prototype = Object.extendsObject(SOWIncidentKnowledgeUtilsSNC, {
    initialize: function() {
        SOWIncidentKnowledgeUtilsSNC.prototype.initialize.call(this);
    },

    type: 'SOWIncidentKnowledgeUtils'
});
