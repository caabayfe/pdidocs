function onAfter(current, previous) {
   new GlideLiveMessagePushNotifier().broadcastFromRecord(current)
}
