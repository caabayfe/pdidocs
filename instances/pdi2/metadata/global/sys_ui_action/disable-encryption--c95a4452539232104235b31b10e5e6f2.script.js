var topicManager = new sn_hermes.HermesTopicManager();
var success = topicManager.disableTopicEncryption(current);
if (success) {
    action.setRedirectURL(current);
}
