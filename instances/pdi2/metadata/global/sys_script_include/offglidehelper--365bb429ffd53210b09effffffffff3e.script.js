var OffGlideHelper = Class.create();
OffGlideHelper.prototype = {
    initialize: function() {},

    retrieveAndUpdateKGUserData: function(resp) {
        if (!GlidePluginManager.isActive('com.sn.va.designer.genai')) return;
        if ((typeof sn_vad_genai.NowAssistVAUnifiedSearchHelper === "undefined")) return;
        var helper = new sn_vad_genai.NowAssistVAUnifiedSearchHelper();
        if (typeof helper.getUserKnowledgeGraph !== "function") return;

        var kgUserData = helper.getUserKnowledgeGraph(resp.conversation.userId, true);
        if (!gs.nil(kgUserData)) {
            resp.kgUserData = kgUserData;
			//adds the kg user data to the conversation context asynchronously
            sn_cs.VASystemObject.setContextVariables(resp.conversation.conversationId, {
                "global_kg_user_data": JSON.stringify(kgUserData)
            });
        }
    },
    type: 'OffGlideHelper'
};
