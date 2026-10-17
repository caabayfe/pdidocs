function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
   new GlideLiveMessagePushNotifier().broadcastMentionFromRecord(current);
}
