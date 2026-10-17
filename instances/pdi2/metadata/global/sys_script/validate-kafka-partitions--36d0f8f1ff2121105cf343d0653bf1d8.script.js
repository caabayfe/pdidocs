(function executeRule(current, previous /*null when async*/ ) {

    var maxPartitions = GlideProperties.getInt('com.glide.maximum_partitions', 32);
    var partitions = parseInt(current.partitions);

    if ((partitions < 1) || (partitions > maxPartitions)) {
        var errorMsg = gs.getMessage('Number of partitions should be within 1-{0}', [maxPartitions]);
        gs.addErrorMessage(errorMsg);
		current.name = '';
		current.namespace = '';
		current.partitions = 1;
        current.setAbortAction(true);
		return;
    }

	var topicManager = new sn_hermes.HermesTopicManager();
    var totalNumberOfUsedPartitions = topicManager.totalUsedPartitions();
	var partitionMax = GlideProperties.getInt('glide.hermes.max.total.partitions',960);
	var newPartitionTotal = totalNumberOfUsedPartitions + parseInt(current.getValue("partitions"));
	if (newPartitionTotal > partitionMax)
	{
		var translatedErr = sn_i18n.Message.getMessage("HERMES_PARTITION_UPDATE", "The partition count across all topics has exceeded the limit ({usedPartitions} used, {totalPartitionsLimit} maximum). To resolve this issue, recreate existing topics with fewer partitions. <b>If the partition count has changed in the cluster, wait for the instance to sync and try again.</b>",{
            usedPartitions: newPartitionTotal.toString(),
			totalPartitionsLimit: partitionMax.toString()
        });
		gs.addErrorMessage(translatedErr);
		current.partitions = 1;
        current.setAbortAction(true);
        return;
	}

})(current, previous);
