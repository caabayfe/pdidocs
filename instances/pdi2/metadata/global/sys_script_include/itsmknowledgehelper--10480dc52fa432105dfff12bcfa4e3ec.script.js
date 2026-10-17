var ITSMKnowledgeHelper = Class.create();
ITSMKnowledgeHelper.prototype = Object.extendsObject(ITSMKnowledgeHelperSNC, {
    initialize: function() {
        ITSMKnowledgeHelperSNC.prototype.initialize.call(this);
    },

    type: 'ITSMKnowledgeHelper'
});
