var VAConversationHelper = Class.create();

VAConversationHelper.isModelTypeMatchedForTopicAndConversation = function(topicSysId, conversationModelType, vaContext) {

    var topicModelType = sn_cs.VASystemObject.getModelTypeForTopic(topicSysId);
    return topicModelType == conversationModelType;

};
