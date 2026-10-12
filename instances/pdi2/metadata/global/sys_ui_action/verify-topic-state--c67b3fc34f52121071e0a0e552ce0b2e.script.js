try {
    var topicManager = new sn_hermes.HermesTopicsUtil();
    topicManager.isTopicSynchronized(current);
} catch (e) {
    var msg = gs.getMessage("Unable to verify topic sync status for {0}", current.name);
    gs.addErrorMessage(msg);
}
