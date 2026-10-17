(function executeRule(current, previous /*null when async*/ ) {
    var currentPartitionCount = parseInt(current.partitions);
    var previousPartitionCount = parseInt(previous.partitions);
    if (currentPartitionCount == previousPartitionCount)
        return;

    var translatedErr;
    if (previousPartitionCount > currentPartitionCount) {
        translatedErr = sn_i18n.Message.getMessage("HERMES_PARTITION_UPDATE", "The number of partitions cannot be decreased");
        gs.addErrorMessage(translatedErr);
        current.setAbortAction(true);
        return;
    }
    var maxPartitions = GlideProperties.getInt('com.glide.maximum_partitions', 32);
    if (currentPartitionCount > maxPartitions) {
        translatedErr = sn_i18n.Message.getMessage("HERMES_PARTITION_UPDATE", "Number of partitions should be within 1-{max}", {
            max: maxPartitions.toString()
        });
        gs.addErrorMessage(translatedErr);
        current.setAbortAction(true);
        return;
    }
    var topicManager = new sn_hermes.HermesTopicManager();
    topicManager.increaseTopicPartitions(previous, current);
})(current, previous);
