var answer = false;
var usedPartitions;
var maxPartitions = GlideProperties.getInt('glide.hermes.max.total.partitions',960);
var topicManager = new sn_hermes.HermesTopicManager();
usedPartitions = topicManager.totalUsedPartitions();
if (usedPartitions > maxPartitions) {
	answer = true;
}
answer;
