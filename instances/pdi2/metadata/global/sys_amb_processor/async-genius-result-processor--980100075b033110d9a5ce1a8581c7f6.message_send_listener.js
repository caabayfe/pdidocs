function /*void*/ onSend( /*String*/ channel, /*Map<String, Object>*/ message, /*String*/ sender) {
    var primarySearchRequestId = message.get("primarySearchRequestId");
    if (primarySearchRequestId) {
        var grProcessor = new sn_search.ScriptableAsyncGeniusResultProcessor();
        grProcessor.toggleClientReady(primarySearchRequestId, true);
    }
}
