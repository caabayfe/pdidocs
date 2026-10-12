var topicsUtil = new sn_hermes.HermesTopicManager();
var success = topicsUtil.enableTopicEncryption(current);
if (success) {
    action.setRedirectURL(current);
}
